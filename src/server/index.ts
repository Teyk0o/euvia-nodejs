/**
 * Euvia Server - Express + Socket.io + Redis
 * High-performance live visitor tracking with RGPD compliance
 */

import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import Redis from 'ioredis';
import type {
  VisitorData,
  LiveStats,
  PageStats,
  TimeSeriesDataPoint,
  HistoricalStats,
  HistoricalPageStats,
} from '../shared/types';
import { unhashPath } from '../shared/utils';

export interface EuviaServerConfig {
  port?: number;
  redisUrl?: string;
  statsTTL?: number; // TTL in seconds (default: 300 = 5min)
  corsOrigins?: string[];
  broadcastInterval?: number; // Broadcast stats every N ms (default: 2000)
  snapshotInterval?: number; // Snapshot capture interval in ms (default: 10000 = 10s)
}

export class EuviaServer {
  private app: express.Application;
  private httpServer: ReturnType<typeof createServer>;
  private io: SocketServer;
  private redis: Redis;
  private config: Required<EuviaServerConfig>;
  private broadcastTimer: NodeJS.Timeout | null = null;
  private snapshotTimer: NodeJS.Timeout | null = null;

  // Redis key prefixes
  private readonly VISITOR_KEY = 'euvia:visitor:';
  private readonly PAGE_KEY = 'euvia:page:';
  private readonly DEVICE_KEY = 'euvia:device:';
  private readonly ACTIVE_VISITORS_KEY = 'euvia:active';

  constructor(config: EuviaServerConfig = {}) {
    this.config = {
      port: config.port ?? parseInt(process.env.PORT || '3001', 10),
      redisUrl: config.redisUrl ?? process.env.REDIS_URL ?? 'redis://localhost:6379',
      statsTTL: config.statsTTL ?? parseInt(process.env.STATS_TTL || '300', 10),
      corsOrigins: config.corsOrigins ?? (process.env.CORS_ORIGINS?.split(',') || ['*']),
      broadcastInterval: config.broadcastInterval ?? 2000,
      snapshotInterval:
        config.snapshotInterval ?? parseInt(process.env.SNAPSHOT_INTERVAL || '10000', 10),
    };

    // Initialize Express
    this.app = express();
    this.httpServer = createServer(this.app);

    // Initialize Socket.io
    this.io = new SocketServer(this.httpServer, {
      cors: {
        origin: this.config.corsOrigins,
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    });

    // Initialize Redis
    this.redis = new Redis(this.config.redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    });

    this.setupRoutes();
    this.setupSocketHandlers();
    this.startStatsBroadcast();
  }

  private setupRoutes() {
    // Health check
    this.app.get('/health', (_req, res) => {
      res.json({
        status: 'ok',
        timestamp: Date.now(),
        redis: this.redis.status,
      });
    });

    // Server info
    this.app.get('/info', (_req, res) => {
      res.json({
        name: '@euvia/live',
        version: '1.0.0',
        uptime: process.uptime(),
        connections: this.io.sockets.sockets.size,
      });
    });
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.info(`[Euvia] Client connected: ${socket.id}`);

      socket.emit('connection:ack');

      // Visitor heartbeat
      socket.on('visitor:heartbeat', async (data: VisitorData) => {
        try {
          await this.handleVisitorHeartbeat(socket.id, data);
        } catch (error) {
          console.error('[Euvia] Error handling heartbeat:', error);
        }
      });

      // Visitor disconnect
      socket.on('visitor:disconnect', async () => {
        await this.handleVisitorDisconnect(socket.id);
      });

      // Admin subscription
      socket.on('admin:subscribe', async () => {
        socket.join('admin');
        console.info(`[Euvia] Admin subscribed: ${socket.id}`);

        // Send immediate stats update
        const stats = await this.getStats();
        socket.emit('stats:update', stats);
      });

      socket.on('admin:unsubscribe', () => {
        socket.leave('admin');
        console.info(`[Euvia] Admin unsubscribed: ${socket.id}`);
      });

      // Historical data request
      socket.on('admin:history:request', async (timeRange: '1h' | '24h') => {
        try {
          const historicalData = await this.getHistoricalStats(timeRange);
          socket.emit('admin:history:response', historicalData);
        } catch (error) {
          console.error('[Euvia] Error fetching historical data:', error);
          socket.emit('admin:history:error', {
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      });

      // Handle disconnect
      socket.on('disconnect', async () => {
        console.info(`[Euvia] Client disconnected: ${socket.id}`);
        await this.handleVisitorDisconnect(socket.id);
      });
    });
  }

  private async handleVisitorHeartbeat(socketId: string, data: VisitorData) {
    const pipeline = this.redis.pipeline();
    const ttl = this.config.statsTTL;

    // Store visitor data with TTL
    const visitorKey = `${this.VISITOR_KEY}${socketId}`;
    pipeline.setex(visitorKey, ttl, JSON.stringify(data));

    // Add to active visitors set
    pipeline.sadd(this.ACTIVE_VISITORS_KEY, socketId);
    pipeline.expire(this.ACTIVE_VISITORS_KEY, ttl);

    // Increment page visitors (with hash for lookup)
    const pageKey = `${this.PAGE_KEY}${data.pageHash}`;
    pipeline.sadd(pageKey, socketId);
    pipeline.expire(pageKey, ttl);

    // Increment device category
    const deviceKey = `${this.DEVICE_KEY}${data.deviceCategory}`;
    pipeline.sadd(deviceKey, socketId);
    pipeline.expire(deviceKey, ttl);

    await pipeline.exec();
  }

  private async handleVisitorDisconnect(socketId: string) {
    const pipeline = this.redis.pipeline();

    // Get visitor data before removing
    const visitorKey = `${this.VISITOR_KEY}${socketId}`;
    const visitorDataStr = await this.redis.get(visitorKey);

    if (visitorDataStr) {
      const visitorData: VisitorData = JSON.parse(visitorDataStr);

      // Remove from all sets
      pipeline.srem(this.ACTIVE_VISITORS_KEY, socketId);
      pipeline.srem(`${this.PAGE_KEY}${visitorData.pageHash}`, socketId);
      pipeline.srem(`${this.DEVICE_KEY}${visitorData.deviceCategory}`, socketId);
    }

    // Delete visitor data
    pipeline.del(visitorKey);

    await pipeline.exec();
  }

  private async getStats(): Promise<LiveStats> {
    // Get total active visitors
    const totalVisitors = await this.redis.scard(this.ACTIVE_VISITORS_KEY);

    // Get device breakdown
    const [mobileCount, desktopCount, tabletCount] = await Promise.all([
      this.redis.scard(`${this.DEVICE_KEY}mobile`),
      this.redis.scard(`${this.DEVICE_KEY}desktop`),
      this.redis.scard(`${this.DEVICE_KEY}tablet`),
    ]);

    // Get top pages
    const pageKeys = await this.redis.keys(`${this.PAGE_KEY}*`);
    const pageStats: PageStats[] = [];

    for (const key of pageKeys) {
      const count = await this.redis.scard(key);
      if (count > 0) {
        const pageHash = key.replace(this.PAGE_KEY, '');
        pageStats.push({
          pageHash,
          originalPath: unhashPath(pageHash),
          visitors: count,
        });
      }
    }

    // Sort by visitor count (descending)
    pageStats.sort((a, b) => b.visitors - a.visitors);

    return {
      totalVisitors,
      topPages: pageStats,
      deviceBreakdown: {
        mobile: mobileCount,
        desktop: desktopCount,
        tablet: tabletCount,
      },
      lastUpdate: Date.now(),
    };
  }

  private async captureSnapshot() {
    try {
      const stats = await this.getStats();
      const timestamp = Date.now();
      const pipeline = this.redis.pipeline();

      console.info(
        `[Euvia] Capturing snapshot - Total visitors: ${stats.totalVisitors}, Pages: ${stats.topPages.length}`,
      );

      const createDataPoint = (value: number) => JSON.stringify({ timestamp, value });

      // Store 1h and 24h snapshots
      pipeline.zadd('euvia:history:1h:total', timestamp, createDataPoint(stats.totalVisitors));
      pipeline.zadd(
        'euvia:history:1h:mobile',
        timestamp,
        createDataPoint(stats.deviceBreakdown.mobile),
      );
      pipeline.zadd(
        'euvia:history:1h:desktop',
        timestamp,
        createDataPoint(stats.deviceBreakdown.desktop),
      );
      pipeline.zadd(
        'euvia:history:1h:tablet',
        timestamp,
        createDataPoint(stats.deviceBreakdown.tablet),
      );

      pipeline.zadd('euvia:history:24h:total', timestamp, createDataPoint(stats.totalVisitors));
      pipeline.zadd(
        'euvia:history:24h:mobile',
        timestamp,
        createDataPoint(stats.deviceBreakdown.mobile),
      );
      pipeline.zadd(
        'euvia:history:24h:desktop',
        timestamp,
        createDataPoint(stats.deviceBreakdown.desktop),
      );
      pipeline.zadd(
        'euvia:history:24h:tablet',
        timestamp,
        createDataPoint(stats.deviceBreakdown.tablet),
      );

      // Store top 5 pages
      const topPages = stats.topPages.slice(0, 5);
      for (const page of topPages) {
        pipeline.zadd(
          `euvia:history:1h:page:${page.pageHash}`,
          timestamp,
          createDataPoint(page.visitors),
        );
        pipeline.zadd(
          `euvia:history:24h:page:${page.pageHash}`,
          timestamp,
          createDataPoint(page.visitors),
        );
      }

      // Cleanup old data
      const oneHourAgo = timestamp - 60 * 60 * 1000;
      const oneDayAgo = timestamp - 24 * 60 * 60 * 1000;

      pipeline.zremrangebyscore('euvia:history:1h:total', '-inf', oneHourAgo);
      pipeline.zremrangebyscore('euvia:history:1h:mobile', '-inf', oneHourAgo);
      pipeline.zremrangebyscore('euvia:history:1h:desktop', '-inf', oneHourAgo);
      pipeline.zremrangebyscore('euvia:history:1h:tablet', '-inf', oneHourAgo);

      pipeline.zremrangebyscore('euvia:history:24h:total', '-inf', oneDayAgo);
      pipeline.zremrangebyscore('euvia:history:24h:mobile', '-inf', oneDayAgo);
      pipeline.zremrangebyscore('euvia:history:24h:desktop', '-inf', oneDayAgo);
      pipeline.zremrangebyscore('euvia:history:24h:tablet', '-inf', oneDayAgo);

      await pipeline.exec();
    } catch (error) {
      console.error('[Euvia] Error capturing snapshot:', error);
    }
  }

  private async getHistoricalStats(timeRange: '1h' | '24h'): Promise<HistoricalStats> {
    const now = Date.now();
    const minTimestamp = timeRange === '1h' ? now - 60 * 60 * 1000 : now - 24 * 60 * 60 * 1000;

    const [totalData, mobileData, desktopData, tabletData, topPages] = await Promise.all([
      this.redis.zrangebyscore(`euvia:history:${timeRange}:total`, minTimestamp, now),
      this.redis.zrangebyscore(`euvia:history:${timeRange}:mobile`, minTimestamp, now),
      this.redis.zrangebyscore(`euvia:history:${timeRange}:desktop`, minTimestamp, now),
      this.redis.zrangebyscore(`euvia:history:${timeRange}:tablet`, minTimestamp, now),
      this.getStats().then((stats) => stats.topPages.slice(0, 5)),
    ]);

    const parseDataPoints = (rawData: string[]): TimeSeriesDataPoint[] => {
      return rawData
        .map((raw) => {
          try {
            return JSON.parse(raw) as TimeSeriesDataPoint;
          } catch {
            return null;
          }
        })
        .filter((dp): dp is TimeSeriesDataPoint => dp !== null);
    };

    const pageTimeSeries: HistoricalPageStats[] = [];
    for (const page of topPages) {
      const pageData = await this.redis.zrangebyscore(
        `euvia:history:${timeRange}:page:${page.pageHash}`,
        minTimestamp,
        now,
      );
      pageTimeSeries.push({
        pageHash: page.pageHash,
        originalPath: page.originalPath,
        dataPoints: parseDataPoints(pageData),
      });
    }

    return {
      totalVisitors: parseDataPoints(totalData),
      deviceBreakdown: {
        mobile: parseDataPoints(mobileData),
        desktop: parseDataPoints(desktopData),
        tablet: parseDataPoints(tabletData),
      },
      topPages: pageTimeSeries,
      timeRange,
      startTime: minTimestamp,
      endTime: now,
    };
  }

  private startSnapshotCapture() {
    console.info(`[Euvia] Starting snapshot capture (interval: ${this.config.snapshotInterval}ms)`);
    this.captureSnapshot(); // Immediate capture
    this.snapshotTimer = setInterval(() => {
      this.captureSnapshot();
    }, this.config.snapshotInterval);
  }

  private startStatsBroadcast() {
    this.broadcastTimer = setInterval(async () => {
      try {
        const stats = await this.getStats();
        this.io.to('admin').emit('stats:update', stats);
      } catch (error) {
        console.error('[Euvia] Error broadcasting stats:', error);
      }
    }, this.config.broadcastInterval);
  }

  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Ensure Redis is connected
      this.redis.once('ready', () => {
        console.info('[Euvia] Redis connected');

        // Start snapshot capture
        this.startSnapshotCapture();

        // Start HTTP server
        this.httpServer.listen(this.config.port, () => {
          console.info(`[Euvia] Server running on port ${this.config.port}`);
          console.info(`[Euvia] WebSocket endpoint: ws://localhost:${this.config.port}`);
          console.info(`[Euvia] Stats TTL: ${this.config.statsTTL}s`);
          resolve();
        });
      });

      this.redis.once('error', (error) => {
        console.error('[Euvia] Redis connection error:', error);
        reject(error);
      });
    });
  }

  public async stop(): Promise<void> {
    if (this.broadcastTimer) {
      clearInterval(this.broadcastTimer);
    }

    if (this.snapshotTimer) {
      clearInterval(this.snapshotTimer);
    }

    await new Promise<void>((resolve) => {
      this.io.close(() => {
        console.info('[Euvia] Socket.io closed');
        resolve();
      });
    });

    await this.redis.quit();
    console.info('[Euvia] Redis connection closed');

    await new Promise<void>((resolve) => {
      this.httpServer.close(() => {
        console.info('[Euvia] HTTP server closed');
        resolve();
      });
    });
  }

  public getApp() {
    return this.app;
  }

  public getIO() {
    return this.io;
  }

  public getRedis() {
    return this.redis;
  }
}

// Export factory function
export function createEuviaServer(config?: EuviaServerConfig): EuviaServer {
  return new EuviaServer(config);
}
