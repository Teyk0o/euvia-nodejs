#!/usr/bin/env node

/**
 * Euvia CLI - Start the tracking server
 */

import { program } from 'commander';
import { config as loadEnv } from 'dotenv';
import { createEuviaServer } from './index';

// Load environment variables
loadEnv();

program
  .name('euvia-live')
  .description('Euvia - GDPR-compliant live visitor tracking server')
  .version('1.0.0');

program
  .command('server')
  .description('Start the Euvia tracking server')
  .option('-p, --port <number>', 'Server port', process.env.PORT || '3001')
  .option(
    '-r, --redis <url>',
    'Redis connection URL',
    process.env.REDIS_URL || 'redis://localhost:6379',
  )
  .option('-t, --ttl <seconds>', 'Stats TTL in seconds', process.env.STATS_TTL || '300')
  .option(
    '-c, --cors <origins>',
    'CORS allowed origins (comma-separated)',
    process.env.CORS_ORIGINS || '*',
  )
  .action(async (options) => {
    try {
      console.info('🚀 Starting Euvia server...\n');

      const server = createEuviaServer({
        port: parseInt(options.port, 10),
        redisUrl: options.redis,
        statsTTL: parseInt(options.ttl, 10),
        corsOrigins: options.cors === '*' ? ['*'] : options.cors.split(','),
      });

      await server.start();

      console.info('\n✅ Euvia server is ready!');
      console.info('\n📖 Usage:');
      console.info('   Client: <EuviaTracker serverUrl="ws://localhost:3001" />');
      console.info('   Admin:  const stats = useEuviaStats("ws://localhost:3001");\n');

      // Graceful shutdown
      const shutdown = async () => {
        console.info('\n🛑 Shutting down Euvia server...');
        await server.stop();
        process.exit(0);
      };

      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);
    } catch (error) {
      console.error('❌ Failed to start Euvia server:', error);
      process.exit(1);
    }
  });

program.parse();
