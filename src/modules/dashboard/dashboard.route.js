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

router.get(
  '/admin-card',
  authenticate,
  authorize(['ADMIN']),
  controller.getAdminCard,
);

router.get(
  '/admin-chart',
  authenticate,
  authorize(['ADMIN']),
  controller.getAdminChart,
);

router.get(
  '/admin-payment-card',
  authenticate,
  authorize(['ADMIN']),
  controller.getAdminPaymentCard,
);

router.get(
  '/admin-recent-subscriptions',
  authenticate,
  authorize(['ADMIN']),
  controller.getResentSubscriptionPlans,
);

module.exports = router;
