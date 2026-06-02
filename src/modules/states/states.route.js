const express = require('express');
const { authenticate, authorize } = require('../../middlewares/auth');
const {
  validate,
  validateParams,
  IdParamSchema,
} = require('../../validators/common.validator');
const StatesController = require('./states.controller');
const {
  createStatesSchema,
  updateStatesSchema,
} = require('./states.validator');

const router = express.Router();
const controller = new StatesController();

router.post(
  '/',
  authenticate,
  authorize(['ADMIN']),
  validate(createStatesSchema),
  controller.create,
);

router.get('/', controller.getAll);

router.get('/:id', validateParams(IdParamSchema), controller.getById);

router.patch(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  validateParams(IdParamSchema),
  validate(updateStatesSchema),
  controller.update,
);

router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  validateParams(IdParamSchema),
  controller.delete,
);

module.exports = router;
