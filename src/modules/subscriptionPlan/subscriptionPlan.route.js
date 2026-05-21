const express = require('express');
const { authenticate, authorize } = require('../../middlewares/auth');
const {
  validate,
  validateParams,
} = require('../../validators/common.validator');
const SubscriptionPlanController = require('./subscriptionPlan.controller');
const {
  createSubscriptionPlanSchema,
  updateSubscriptionPlanSchema,
  subscriptionPlanIdParamSchema,
} = require('./subscriptionPlan.validator');

const router = express.Router();
const controller = new SubscriptionPlanController();

router.post(
  '/',
  authenticate,
  authorize(['ADMIN']),
  validate(createSubscriptionPlanSchema),
  controller.createSubscriptionPlan,
);

router.get('/', controller.getSubscriptionPlans);

router.get(
  '/:id',
  validateParams(subscriptionPlanIdParamSchema),
  controller.getSubscriptionPlanById,
);

router.patch(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  validateParams(subscriptionPlanIdParamSchema),
  validate(updateSubscriptionPlanSchema),
  controller.updateSubscriptionPlan,
);

router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  validateParams(subscriptionPlanIdParamSchema),
  controller.deleteSubscriptionPlan,
);

module.exports = router;
