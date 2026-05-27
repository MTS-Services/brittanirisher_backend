const express = require('express');
const { authenticate, authorize } = require('../../middlewares/auth');
const {
  validate,
  validateParams,
  IdParamSchema,
} = require('../../validators/common.validator');

const ExpenseController = require('./coupleExpense.controller');
const {
  createExpenseSchema,
  updateExpenseSchema,
} = require('./coupleExpense.validator');

const router = express.Router();
const controller = new ExpenseController();

router.post(
  '/',
  authenticate,
  authorize(['COUPLE']),
  validate(createExpenseSchema),
  controller.createExpense,
);

router.get('/', authenticate, authorize(['COUPLE']), controller.getAllExpense);

router.get('/:id', validateParams(IdParamSchema), controller.getByIdExpense);

router.patch(
  '/:id',
  authenticate,
  authorize(['COUPLE']),
  validateParams(IdParamSchema),
  validate(updateExpenseSchema),
  controller.updateExpense,
);

router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  validateParams(IdParamSchema),
  controller.deleteExpense,
);

module.exports = router;
