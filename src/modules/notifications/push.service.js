'use strict';

const logger = require('../../utils/logger');

/**
 * Stub for Firebase Cloud Messaging.
 * To wire it up: install firebase-admin, init with serviceAccountKey,
 * then admin.messaging().send({ token, notification, data }).
 */
exports.send = async (token, payload) => {
  logger.info('[Push stub]', { token: token?.slice(0, 12), payload });
  return { ok: true, stub: true };
};

exports.sendToTopic = async (topic, payload) => {
  logger.info('[Push topic stub]', { topic, payload });
  return { ok: true, stub: true };
};
