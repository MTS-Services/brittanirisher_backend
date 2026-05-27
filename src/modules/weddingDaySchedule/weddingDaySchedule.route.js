const express = require('express');
const { authenticate, authorize } = require('../../middlewares/auth');
const {
  validate,
  validateParams,
  IdParamSchema,
} = require('../../validators/common.validator');
const WeddingScheduleController = require('./weddingDaySchedule.controller');
const {
  createScheduleSchema,
  updateScheduleSchema,
} = require('./weddingDaySchedule.validator');

const router = express.Router();
const controller = new WeddingScheduleController();

router.post(
  '/',
  authenticate,
  authorize(['COUPLE']),
  validate(createScheduleSchema),
  controller.createWeddingSchedule,
);

router.get(
  '/',
  authenticate,
  authorize(['COUPLE']),
  controller.getWeddingSchedule,
);

router.get(
  '/:id',
  authenticate,
  authorize(['COUPLE']),
  validateParams(IdParamSchema),
  controller.WeddingScheduleById,
);

router.patch(
  '/:id',
  authenticate,
  authorize(['COUPLE']),
  validateParams(IdParamSchema),
  validate(updateScheduleSchema),
  controller.updateWeddingSchedule,
);

router.delete(
  '/:id',
  authenticate,
  authorize(['COUPLE']),
  validateParams(IdParamSchema),
  controller.deleteWeddingSchedule,
);

module.exports = router;
