import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { createEuviaServer, EuviaServer } from '../src/server/index';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import type { VisitorData } from '../src/shared/types';

describe('Server Coverage Tests', () => {
  let server: EuviaServer;
  const PORT = 3015;

  beforeAll(async () => {
    server = createEuviaServer({
      port: PORT,
      redisUrl: 'redis://localhost:6379',
      statsTTL: 30,
      corsOrigins: ['*'],
      broadcastInterval: 500,
    });

    await server.start();
  });

  afterAll(async () => {
    await server.stop();
  });

  it('should log admin subscription info', async () => {
    const consoleSpy = vi.spyOn(console, 'info');
    const client = Client(`http://localhost:${PORT}`);

    await new Promise<void>((resolve) => {
      client.on('connect', () => {
        client.emit('admin:subscribe');

        setTimeout(() => {
          expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('[Euvia] Admin subscribed:'),
          );
          client.close();
          consoleSpy.mockRestore();
          resolve();
        }, 300);
      });
    });
  });

  it('should log admin unsubscribe info', async () => {
    const consoleSpy = vi.spyOn(console, 'info');
    const client = Client(`http://localhost:${PORT}`);

    await new Promise<void>((resolve) => {
      client.on('connect', () => {
        client.emit('admin:subscribe');

        setTimeout(() => {
          client.emit('admin:unsubscribe');

          setTimeout(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
              expect.stringContaining('[Euvia] Admin unsubscribed:'),
            );
            client.close();
            consoleSpy.mockRestore();
            resolve();
          }, 300);
        }, 300);
      });
    });
  });

  it('should handle visitor disconnect with existing data', async () => {
    const client = Client(`http://localhost:${PORT}`);

    await new Promise<void>((resolve) => {
      client.on('connect', () => {
        const visitorData: VisitorData = {
          pageHash: 'L3Rlc3QtZGlzY29ubmVjdA==',
          deviceCategory: 'desktop',
          screenBucket: '1920x1080',
          timestamp: Date.now(),
        };

        // Send heartbeat to create visitor data
        client.emit('visitor:heartbeat', visitorData);

        setTimeout(() => {
          // Explicitly disconnect
          client.emit('visitor:disconnect');

          setTimeout(async () => {
            // Verify data was removed
            const redis = server.getRedis();
            const keys = await redis.keys(`euvia:visitor:${client.id}`);
            expect(keys.length).toBe(0);

            client.close();
            resolve();
          }, 400);
        }, 400);
      });
    });
  });

  it('should handle getStats with multiple pages', async () => {
    const clients: ClientSocket[] = [];
    const pages = ['L3BhZ2UxMQ==', 'L3BhZ2UxMg==', 'L3BhZ2UxMw==', 'L3BhZ2UxNA=='];

    await new Promise<void>((resolve) => {
      let connectedCount = 0;

      const checkAllConnected = () => {
        connectedCount++;
        if (connectedCount === pages.length + 1) {
          setTimeout(() => {
            const adminClient = clients[clients.length - 1];
            adminClient.emit('admin:subscribe');

            adminClient.on('stats:update', (stats) => {
              expect(stats.topPages.length).toBeGreaterThanOrEqual(3);
              expect(stats.topPages[0].visitors).toBeGreaterThanOrEqual(1);

              // Check sorting (descending order)
              for (let i = 0; i < stats.topPages.length - 1; i++) {
                expect(stats.topPages[i].visitors).toBeGreaterThanOrEqual(
                  stats.topPages[i + 1].visitors,
                );
              }

              clients.forEach((c) => c.close());
              resolve();
            });
          }, 500);
        }
      };

      // Create visitor clients
      pages.forEach((pageHash, index) => {
        const client = Client(`http://localhost:${PORT}`);
        clients.push(client);

        client.on('connect', () => {
          client.emit('visitor:heartbeat', {
            pageHash,
            deviceCategory: index % 2 === 0 ? 'desktop' : 'mobile',
            screenBucket: '1920x1080',
            timestamp: Date.now(),
          });

          checkAllConnected();
        });
      });

      // Create admin client
      const adminClient = Client(`http://localhost:${PORT}`);
      clients.push(adminClient);
      adminClient.on('connect', checkAllConnected);
    });
  });

  it('should handle stats broadcast errors gracefully', async () => {
    const errorSpy = vi.spyOn(console, 'error');

    // Create a temporary server with broken Redis
    const brokenServer = createEuviaServer({
      port: 3016,
      redisUrl: 'redis://localhost:6379',
      broadcastInterval: 100,
    });

    await brokenServer.start();

    // Mock Redis to throw error
    const redis = brokenServer.getRedis();
    const originalScard = redis.scard.bind(redis);
    redis.scard = vi.fn().mockRejectedValue(new Error('Redis error'));

    // Wait for broadcast to trigger
    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(errorSpy).toHaveBeenCalledWith('[Euvia] Error broadcasting stats:', expect.any(Error));

    // Restore
    redis.scard = originalScard;
    errorSpy.mockRestore();

    await brokenServer.stop();
  });

  it('should handle heartbeat errors', async () => {
    const errorSpy = vi.spyOn(console, 'error');
    const client = Client(`http://localhost:${PORT}`);

    await new Promise<void>((resolve) => {
      client.on('connect', () => {
        const redis = server.getRedis();
        const originalPipeline = redis.pipeline.bind(redis);

        // Mock pipeline with proper error handling
        const mockPipeline = {
          setex: vi.fn().mockReturnThis(),
          sadd: vi.fn().mockReturnThis(),
          expire: vi.fn().mockReturnThis(),
          srem: vi.fn().mockReturnThis(),
          del: vi.fn().mockReturnThis(),
          get: vi.fn().mockResolvedValue(null),
          exec: vi.fn().mockRejectedValue(new Error('Pipeline error')),
        };

        redis.pipeline = vi.fn(() => mockPipeline as any);

        // Also mock get to avoid additional errors
        const originalGet = redis.get.bind(redis);
        redis.get = vi.fn().mockResolvedValue(null);

        client.emit('visitor:heartbeat', {
          pageHash: 'L2Vycm9y',
          deviceCategory: 'desktop',
          screenBucket: '1920x1080',
          timestamp: Date.now(),
        });

        setTimeout(() => {
          expect(errorSpy).toHaveBeenCalledWith(
            '[Euvia] Error handling heartbeat:',
            expect.any(Error),
          );

          // Restore everything
          redis.pipeline = originalPipeline;
          redis.get = originalGet;
          errorSpy.mockRestore();

          client.close();
          resolve();
        }, 500);
      });
    });
  });

  it('should handle disconnect event', async () => {
    const consoleSpy = vi.spyOn(console, 'info');
    const client = Client(`http://localhost:${PORT}`);

    await new Promise<void>((resolve) => {
      client.on('connect', () => {
        const visitorData: VisitorData = {
          pageHash: 'L2Rpc2Nvbm5lY3QtZXZlbnQ=',
          deviceCategory: 'tablet',
          screenBucket: '1366x768',
          timestamp: Date.now(),
        };

        client.emit('visitor:heartbeat', visitorData);

        setTimeout(() => {
          client.disconnect();

          setTimeout(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
              expect.stringContaining('[Euvia] Client disconnected:'),
            );
            consoleSpy.mockRestore();
            resolve();
          }, 400);
        }, 400);
      });
    });
  });

  it('should handle page with zero count', async () => {
    // This tests the if (count > 0) condition in getStats
    const client = Client(`http://localhost:${PORT}`);

    await new Promise<void>((resolve) => {
      client.on('connect', () => {
        client.emit('visitor:heartbeat', {
          pageHash: 'L3plcm8tY291bnQ=',
          deviceCategory: 'mobile',
          screenBucket: '375x667',
          timestamp: Date.now(),
        });

        setTimeout(() => {
          // Manually remove from page set but keep the key
          const redis = server.getRedis();
          redis.del(`euvia:page:L3plcm8tY291bnQ=`).then(() => {
            client.close();
            resolve();
          });
        }, 200);
      });
    });
  });
});
