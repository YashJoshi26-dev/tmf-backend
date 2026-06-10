'use strict';

// Admin-only operations live in the relevant module's service.
// This file is the orchestration layer for cross-module admin actions
// (only dashboard for now).
const dashboardSvc = require('./dashboard.service');

exports.overview = dashboardSvc.overview;
