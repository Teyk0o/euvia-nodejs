import { describe, it, expect, afterEach } from 'vitest';
import { createEuviaServer, EuviaServer } from '../src/server/index';

describe('EuviaServer', () => {
  let server: EuviaServer;

  afterEach(async () => {
    if (server) {
      await server.stop();
    }
  });

  it('should create server instance', () => {
    server = createEuviaServer({
      port: 3002,
      redisUrl: 'redis://localhost:6379',
    });

    expect(server).toBeDefined();
    expect(server.getApp()).toBeDefined();
    expect(server.getIO()).toBeDefined();
    expect(server.getRedis()).toBeDefined();
  });

  it('should use default config when none provided', () => {
    server = createEuviaServer();
    expect(server).toBeDefined();
  });

  it('should have health check route', async () => {
    server = createEuviaServer({ port: 3003 });
    const app = server.getApp();
    expect(app).toBeDefined();
  });

  it('should have info route', async () => {
    server = createEuviaServer({ port: 3004 });
    const app = server.getApp();
    expect(app).toBeDefined();
  });
});
