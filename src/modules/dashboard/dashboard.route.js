const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../middlewares/auth');
const { validate } = require('../../validators/common.validator');
const DashboardController = require('./dashboard.controller');

const controller = new DashboardController();

router.get(
  '/vendor-data',
  authenticate,
  authorize(['VENDOR']),
  controller.getVendorDashboardData,
);

router.get(
  '/vendor-chart',
  authenticate,
  authorize(['VENDOR']),
  controller.getLeadVendorAnalytics,
);

module.exports = router;
