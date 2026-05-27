const express = require('express');
const { authenticate, authorize } = require('../../middlewares/auth');
const {
  validate,
  validateParams,
  IdParamSchema,
} = require('../../validators/common.validator');

const TaskSectionController = require('./taskSection.controller');
const {
  createTaskSectionSchema,
  updateTaskSectionSchema,
  updateTaskStatusSchema,
} = require('./taskSection.validator');

const router = express.Router();
const controller = new TaskSectionController();

router.post(
  '/',
  authenticate,
  authorize(['COUPLE']),
  validate(createTaskSectionSchema),
  controller.createTaskSection,
);

router.get('/', authenticate, authorize(['COUPLE']), controller.getTaskSection);

router.get(
  '/:id',
  authenticate,
  authorize(['COUPLE']),
  validateParams(IdParamSchema),
  controller.getTaskSectionById,
);

router.patch(
  '/:id',
  authenticate,
  authorize(['COUPLE']),
  validateParams(IdParamSchema),
  validate(updateTaskSectionSchema),
  controller.updateTaskSection,
);

router.patch(
  '/task-status/:taskId',
  authenticate,
  authorize(['COUPLE']),
  validate(updateTaskStatusSchema),
  controller.updateTaskStatus,
);

router.delete(
  '/:id',
  authenticate,
  authorize(['COUPLE']),
  validateParams(IdParamSchema),
  controller.deleteTaskSection,
);

router.delete(
  '/task/:id',
  authenticate,
  authorize(['COUPLE']),
  validateParams(IdParamSchema),
  controller.deleteTask,
);

module.exports = router;
