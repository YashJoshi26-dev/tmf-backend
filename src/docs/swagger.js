'use strict';

const swaggerUi = require('swagger-ui-express');
const spec = require('./openapi.json');

/**
 * Mounts Swagger UI at /api-docs.
 * The spec is intentionally light — extend openapi.json as the API stabilises.
 */
exports.mount = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec, {
    customSiteTitle: 'Saree Showroom API',
    customCss: '.swagger-ui .topbar { background: #7B1E2B; }',
  }));
};
