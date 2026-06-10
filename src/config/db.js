'use strict';

const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

mongoose.set('strictQuery', true);

let connected = false;

const connectDB = async () => {
  if (connected) return mongoose.connection;
  try {
    const conn = await mongoose.connect(env.mongo.uri, {
      autoIndex: !env.isProd,
      maxPoolSize: 50,
      serverSelectionTimeoutMS: 10000,
    });
    connected = true;
    logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn.connection;
  } catch (err) {
    logger.error('MongoDB connection failed', { error: err.message });
    throw err;
  }
};

const disconnectDB = async () => {
  if (!connected) return;
  await mongoose.disconnect();
  connected = false;
  logger.info('MongoDB disconnected');
};

mongoose.connection.on('error', (err) => logger.error('Mongo runtime error', { error: err.message }));
mongoose.connection.on('disconnected', () => { connected = false; logger.warn('Mongo disconnected'); });

module.exports = { connectDB, disconnectDB };
