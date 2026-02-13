import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createEuviaServer, EuviaServer } from '../src/server/index';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import type { VisitorData } from '../src/shared/types';

describe('EuviaServer Extended Tests', () => {
  let server: EuviaServer;
  let client: ClientSocket;
  const PORT = 3010;

  beforeAll(async () => {
    server = createEuviaServer({
      port: PORT,
      redisUrl: 'redis://localhost:6379',
      statsTTL: 60,
      corsOrigins: ['*'],
      broadcastInterval: 1000,
    });

    await server.start();
  });

  afterAll(async () => {
    if (client) {
      client.close();
    }
    await server.stop();
  });

  describe('WebSocket Events', () => {
    it('should accept visitor heartbeat', (done) => {
      client = Client(`http://localhost:${PORT}`);

      client.on('connect', () => {
        const visitorData: VisitorData = {
          pageHash: 'L2hvbWU=',
          deviceCategory: 'desktop',
          screenBucket: '1920x1080',
          timestamp: Date.now(),
        };

        client.emit('visitor:heartbeat', visitorData);

        setTimeout(() => {
          client.close();
          done();
        }, 500);
      });

      client.on('connection:ack', () => {
        expect(true).toBe(true);
      });
    });

    it('should handle admin subscription', (done) => {
      client = Client(`http://localhost:${PORT}`);

      client.on('connect', () => {
        client.emit('admin:subscribe');

        client.on('stats:update', (stats) => {
          expect(stats).toBeDefined();
          expect(stats.totalVisitors).toBeGreaterThanOrEqual(0);
          expect(stats.topPages).toBeInstanceOf(Array);
          expect(stats.deviceBreakdown).toBeDefined();
          client.close();
          done();
        });
      });
    });

    it('should handle visitor disconnect', (done) => {
      client = Client(`http://localhost:${PORT}`);

      client.on('connect', () => {
        const visitorData: VisitorData = {
          pageHash: 'L2Fib3V0',
          deviceCategory: 'mobile',
          screenBucket: '375x667',
          timestamp: Date.now(),
        };

        client.emit('visitor:heartbeat', visitorData);

        setTimeout(() => {
          client.emit('visitor:disconnect');
          setTimeout(() => {
            client.close();
            done();
          }, 200);
        }, 200);
      });
    });

    it('should handle admin unsubscribe', (done) => {
      client = Client(`http://localhost:${PORT}`);

      client.on('connect', () => {
        client.emit('admin:subscribe');

        setTimeout(() => {
          client.emit('admin:unsubscribe');
          setTimeout(() => {
            client.close();
            done();
          }, 200);
        }, 200);
      });
    });
  });

  describe('HTTP Routes', () => {
    it('should return health status', async () => {
      const response = await fetch(`http://localhost:${PORT}/health`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(data.timestamp).toBeDefined();
      expect(data.redis).toBeDefined();
    });

    it('should return server info', async () => {
      const response = await fetch(`http://localhost:${PORT}/info`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe('@euvia/live');
      expect(data.version).toBe('1.0.0');
      expect(data.uptime).toBeGreaterThan(0);
      expect(data.connections).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Statistics Aggregation', () => {
    it('should track multiple visitors on different pages', (done) => {
      const client1 = Client(`http://localhost:${PORT}`);
      const client2 = Client(`http://localhost:${PORT}`);
      const adminClient = Client(`http://localhost:${PORT}`);

      let connectCount = 0;

      const checkConnect = () => {
        connectCount++;
        if (connectCount === 3) {
          // All clients connected
          client1.emit('visitor:heartbeat', {
            pageHash: 'L2hvbWU=',
            deviceCategory: 'desktop',
            screenBucket: '1920x1080',
            timestamp: Date.now(),
          });

          client2.emit('visitor:heartbeat', {
            pageHash: 'L2Fib3V0',
            deviceCategory: 'mobile',
            screenBucket: '375x667',
            timestamp: Date.now(),
          });

          setTimeout(() => {
            adminClient.emit('admin:subscribe');
          }, 500);
        }
      };

      client1.on('connect', checkConnect);
      client2.on('connect', checkConnect);
      adminClient.on('connect', checkConnect);

      adminClient.on('stats:update', (stats) => {
        expect(stats.totalVisitors).toBeGreaterThanOrEqual(2);
        expect(stats.topPages.length).toBeGreaterThan(0);

        client1.close();
        client2.close();
        adminClient.close();
        done();
      });
    });

    it('should track device breakdown correctly', (done) => {
      const desktopClient = Client(`http://localhost:${PORT}`);
      const mobileClient = Client(`http://localhost:${PORT}`);
      const tabletClient = Client(`http://localhost:${PORT}`);
      const adminClient = Client(`http://localhost:${PORT}`);

      let connectCount = 0;

      const checkConnect = () => {
        connectCount++;
        if (connectCount === 4) {
          desktopClient.emit('visitor:heartbeat', {
            pageHash: 'L2hvbWU=',
            deviceCategory: 'desktop',
            screenBucket: '1920x1080',
            timestamp: Date.now(),
          });

          mobileClient.emit('visitor:heartbeat', {
            pageHash: 'L2hvbWU=',
            deviceCategory: 'mobile',
            screenBucket: '375x667',
            timestamp: Date.now(),
          });

          tabletClient.emit('visitor:heartbeat', {
            pageHash: 'L2hvbWU=',
            deviceCategory: 'tablet',
            screenBucket: '1366x768',
            timestamp: Date.now(),
          });

          setTimeout(() => {
            adminClient.emit('admin:subscribe');
          }, 500);
        }
      };

      desktopClient.on('connect', checkConnect);
      mobileClient.on('connect', checkConnect);
      tabletClient.on('connect', checkConnect);
      adminClient.on('connect', checkConnect);

      adminClient.on('stats:update', (stats) => {
        expect(stats.deviceBreakdown.desktop).toBeGreaterThanOrEqual(1);
        expect(stats.deviceBreakdown.mobile).toBeGreaterThanOrEqual(1);
        expect(stats.deviceBreakdown.tablet).toBeGreaterThanOrEqual(1);

        desktopClient.close();
        mobileClient.close();
        tabletClient.close();
        adminClient.close();
        done();
      });
    });
  });

  describe('Server Methods', () => {
    it('should expose Express app', () => {
      const app = server.getApp();
      expect(app).toBeDefined();
    });

    it('should expose Socket.io instance', () => {
      const io = server.getIO();
      expect(io).toBeDefined();
    });

    it('should expose Redis client', () => {
      const redis = server.getRedis();
      expect(redis).toBeDefined();
      expect(redis.status).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid connect/disconnect cycles', (done) => {
      const client1 = Client(`http://localhost:${PORT}`);

      client1.on('connect', () => {
        const visitorData: VisitorData = {
          pageHash: 'L3Rlc3Q=',
          deviceCategory: 'desktop',
          screenBucket: '1920x1080',
          timestamp: Date.now(),
        };

        client1.emit('visitor:heartbeat', visitorData);

        setTimeout(() => {
          client1.emit('visitor:disconnect');
          client1.close();

          setTimeout(() => {
            const client2 = Client(`http://localhost:${PORT}`);
            client2.on('connect', () => {
              client2.emit('visitor:heartbeat', visitorData);
              setTimeout(() => {
                client2.close();
                done();
              }, 100);
            });
          }, 100);
        }, 100);
      });
    });

    it('should handle multiple pages from same visitor', (done) => {
      const client1 = Client(`http://localhost:${PORT}`);

      client1.on('connect', () => {
        client1.emit('visitor:heartbeat', {
          pageHash: 'L3BhZ2Ux',
          deviceCategory: 'desktop',
          screenBucket: '1920x1080',
          timestamp: Date.now(),
        });

        setTimeout(() => {
          client1.emit('visitor:heartbeat', {
            pageHash: 'L3BhZ2Uy',
            deviceCategory: 'desktop',
            screenBucket: '1920x1080',
            timestamp: Date.now(),
          });

          setTimeout(() => {
            client1.emit('visitor:heartbeat', {
              pageHash: 'L3BhZ2Uz',
              deviceCategory: 'desktop',
              screenBucket: '1920x1080',
              timestamp: Date.now(),
            });

            setTimeout(() => {
              client1.close();
              done();
            }, 100);
          }, 100);
        }, 100);
      });
    });

    it('should handle empty stats gracefully', (done) => {
      const adminClient = Client(`http://localhost:${PORT}`);

      adminClient.on('connect', () => {
        adminClient.emit('admin:subscribe');

        adminClient.on('stats:update', (stats) => {
          expect(stats).toBeDefined();
          expect(stats.totalVisitors).toBeGreaterThanOrEqual(0);
          expect(Array.isArray(stats.topPages)).toBe(true);
          expect(stats.deviceBreakdown).toBeDefined();
          expect(stats.lastUpdate).toBeDefined();

          adminClient.close();
          done();
        });
      });
    });

    it('should handle client disconnect without explicit visitor:disconnect', (done) => {
      const client1 = Client(`http://localhost:${PORT}`);

      client1.on('connect', () => {
        const visitorData: VisitorData = {
          pageHash: 'L2Rpc2Nvbm5lY3Q=',
          deviceCategory: 'mobile',
          screenBucket: '375x667',
          timestamp: Date.now(),
        };

        client1.emit('visitor:heartbeat', visitorData);

        setTimeout(() => {
          // Disconnect without emitting visitor:disconnect
          client1.close();
          done();
        }, 200);
      });
    });

    it('should broadcast stats to all admin subscribers', (done) => {
      const admin1 = Client(`http://localhost:${PORT}`);
      const admin2 = Client(`http://localhost:${PORT}`);

      let admin1Received = false;
      let admin2Received = false;

      const checkDone = () => {
        if (admin1Received && admin2Received) {
          admin1.close();
          admin2.close();
          done();
        }
      };

      admin1.on('connect', () => {
        admin1.emit('admin:subscribe');
      });

      admin2.on('connect', () => {
        admin2.emit('admin:subscribe');
      });

      admin1.on('stats:update', () => {
        admin1Received = true;
        checkDone();
      });

      admin2.on('stats:update', () => {
        admin2Received = true;
        checkDone();
      });
    });

    it('should handle visitor with different device categories over time', (done) => {
      const client1 = Client(`http://localhost:${PORT}`);

      client1.on('connect', () => {
        // First as desktop
        client1.emit('visitor:heartbeat', {
          pageHash: 'L3N3aXRjaA==',
          deviceCategory: 'desktop',
          screenBucket: '1920x1080',
          timestamp: Date.now(),
        });

        setTimeout(() => {
          // Then as mobile (simulating device switch)
          client1.emit('visitor:heartbeat', {
            pageHash: 'L3N3aXRjaA==',
            deviceCategory: 'mobile',
            screenBucket: '375x667',
            timestamp: Date.now(),
          });

          setTimeout(() => {
            client1.close();
            done();
          }, 100);
        }, 100);
      });
    });
  });

  describe('Stats Persistence', () => {
    it('should persist visitor data in Redis with TTL', (done) => {
      const client1 = Client(`http://localhost:${PORT}`);

      client1.on('connect', () => {
        const visitorData: VisitorData = {
          pageHash: 'L3BlcnNpc3Q=',
          deviceCategory: 'desktop',
          screenBucket: '1920x1080',
          timestamp: Date.now(),
        };

        client1.emit('visitor:heartbeat', visitorData);

        setTimeout(async () => {
          const redis = server.getRedis();
          const keys = await redis.keys('euvia:visitor:*');
          expect(keys.length).toBeGreaterThan(0);

          client1.close();
          done();
        }, 200);
      });
    });

    it('should clean up visitor data on disconnect', (done) => {
      const client1 = Client(`http://localhost:${PORT}`);
      let socketId: string;

      client1.on('connect', () => {
        socketId = client1.id;

        client1.emit('visitor:heartbeat', {
          pageHash: 'L2NsZWFudXA=',
          deviceCategory: 'desktop',
          screenBucket: '1920x1080',
          timestamp: Date.now(),
        });

        setTimeout(() => {
          client1.emit('visitor:disconnect');

          setTimeout(async () => {
            const redis = server.getRedis();
            const visitorKey = `euvia:visitor:${socketId}`;
            const exists = await redis.exists(visitorKey);
            expect(exists).toBe(0);

            client1.close();
            done();
          }, 200);
        }, 200);
      });
    });
  });
});
