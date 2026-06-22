'use strict';

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const env = require('./config/env');
const corsOpts = require('./config/cors');
const logger = require('./utils/logger');
const { applySecurity } = require('./middleware/security.middleware');
const { apiLimiter } = require('./middleware/rateLimit.middleware');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

const healthRoutes  = require('./routes/health.routes');
const webhookRoutes = require('./routes/webhook.routes');
const apiRoutes     = require('./routes');
const swagger       = require('./docs/swagger');
const sitemapRoutes = require('./routes/sitemap');

const app = express();

app.set('trust proxy', 1);

// 1. CORS first (so OPTIONS preflights succeed even before helmet)
app.use(cors(corsOpts));

// 2. Security headers + sanitization
applySecurity(app);

// 3. Logging
if (!env.isTest) app.use(morgan(env.isDev ? 'dev' : 'combined', { stream: logger.stream }));

// 4. Webhooks BEFORE JSON parser (need raw body for HMAC)
app.use(`${env.apiPrefix}/webhooks`, webhookRoutes);

// 5. Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// 6. Health (unauthenticated)
app.use('/health', healthRoutes);
app.use('/', sitemapRoutes);

// 7. Swagger
swagger.mount(app);

// 8. Rate limit + API routes
app.use(env.apiPrefix, apiLimiter);
app.use(env.apiPrefix, apiRoutes);

// 9. 404 + error handler (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
