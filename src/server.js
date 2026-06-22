'use strict';

const http = require('http');
const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');
const { connectDB, disconnectDB } = require('./config/db');
const sockets = require('./sockets');
const inventoryJob = require('./modules/inventory/jobs/inventorySync.job');

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

let server;

const start = async () => {
  await connectDB();

  // Eagerly register queue handlers so their job names are known
  require('./modules/inventory/jobs/csvImport.job');
  require('./modules/inventory/queues/inventory.queue');

  server = http.createServer(app);
  sockets.init(server);

  // Boot cron AFTER db is connected
  inventoryJob.start();

  server.listen(env.port, () => {
    logger.info(`API listening on http://localhost:${env.port}${env.apiPrefix}`);
    logger.info(`Docs:    http://localhost:${env.port}/api-docs`);
    logger.info(`Health:  http://localhost:${env.port}/health`);
  });
};

const shutdown = async (signal, code = 0) => {
  logger.info(`${signal} received — shutting down`);
  try { inventoryJob.stop(); } catch {}
  if (server) await new Promise((r) => server.close(r));
  try { await disconnectDB(); } catch (e) { logger.error('DB shutdown error', { error: e.message }); }
  process.exit(code);
};

process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (r) => {
  logger.error('unhandledRejection', { reason: r instanceof Error ? r.stack : r });
  shutdown('unhandledRejection', 1);
});
process.on('uncaughtException', (e) => {
  logger.error('uncaughtException', { error: e.stack });
  shutdown('uncaughtException', 1);
});

start().catch((err) => {
  logger.error('Startup failed', { error: err.message, stack: err.stack });
  process.exit(1);
});
