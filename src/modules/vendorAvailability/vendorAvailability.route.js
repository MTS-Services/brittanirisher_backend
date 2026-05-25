const express = require('express');
const { authenticate, authorize } = require('../../middlewares/auth');
const {
  validate,
  validateParams,
  validateQuery,
} = require('../../validators/common.validator');
const VendorAvailabilityController = require('./vendorAvailability.controller');
const {
  createVendorAvailabilitySchema,
  updateVendorAvailabilitySchema,
  vendorAvailabilityIdParamSchema,
  vendorAvailabilityFilterQuerySchema,
  availabilityCalendarQuerySchema,
  setMonthlyAvailabilitySchema,
} = require('./vendorAvailability.validator');


const router = express.Router();
const controller = new VendorAvailabilityController();

router.get(
  '/calendar',
  validateQuery(availabilityCalendarQuerySchema),
  controller.getCalendarByVendorAndMonth,
);

router.post(
  '/',
  authenticate,
  authorize(['VENDOR']),
  validate(createVendorAvailabilitySchema),
  controller.createAvailability,
);

router.post(
  '/bulk/month',
  authenticate,
  authorize(['VENDOR']),
  validate(setMonthlyAvailabilitySchema),
  controller.setMonthlyAvailability,
);

router.get(
  '/',
  authenticate,
  authorize(['ADMIN', 'VENDOR']),
  validateQuery(vendorAvailabilityFilterQuerySchema),
  controller.getAvailabilities,
);

router.get(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'VENDOR']),
  validateParams(vendorAvailabilityIdParamSchema),
  controller.getAvailabilityById,
);

router.patch(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'VENDOR']),
  validateParams(vendorAvailabilityIdParamSchema),
  validate(updateVendorAvailabilitySchema),
  controller.updateAvailability,
);

router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'VENDOR']),
  validateParams(vendorAvailabilityIdParamSchema),
  controller.deleteAvailability,
);

module.exports = router;
