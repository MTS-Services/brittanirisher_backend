const express = require('express');
const { authenticate, authorize } = require('../../middlewares/auth');
const {
  validate,
  validateParams,
  validateQuery,
} = require('../../validators/common.validator');
const BookingController = require('./booking.controller');
const {
  createBookingSchema,
  updateBookingSchema,
  bookingIdParamSchema,
  bookingFilterQuerySchema,
} = require('./booking.validator');

const router = express.Router();
const controller = new BookingController();

router.post(
  '/',
  authenticate,
  authorize(['VENDOR']),
  validate(createBookingSchema),
  controller.createBooking,
);

router.get(
  '/',
  authenticate,
  authorize(['ADMIN', 'VENDOR']),
  validateQuery(bookingFilterQuerySchema),
  controller.getBookings,
);

router.get(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'VENDOR']),
  validateParams(bookingIdParamSchema),
  controller.getBookingById,
);

router.patch(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'VENDOR']),
  validateParams(bookingIdParamSchema),
  validate(updateBookingSchema),
  controller.updateBooking,
);

router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'VENDOR']),
  validateParams(bookingIdParamSchema),
  controller.deleteBooking,
);

module.exports = router;
