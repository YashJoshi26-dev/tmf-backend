'use strict';

const logger = require('../utils/logger');

/**
 * Sockets are stubbed for the pragmatic build. The same `emit*` API is used by the
 * order/inventory services; swapping in real Socket.IO is contained to this file.
 *
 * To enable Socket.IO:
 *   const { Server } = require('socket.io');
 *   const io = new Server(httpServer, { cors: corsConfig });
 *   io.on('connection', ...);
 *   exports.io = io;
 */

let io = null;

const init = (httpServer) => {
  // Intentional no-op. Wire Socket.IO here when ready.
  logger.debug('Sockets stub initialised', { httpServer: !!httpServer });
};

const emitToUser  = (userId, event, payload) => logger.debug('[socket] user emit', { userId, event, payload });
const emitToAdmin = (event, payload)         => logger.debug('[socket] admin emit', { event, payload });

module.exports = { init, emitToUser, emitToAdmin, get io() { return io; } };
