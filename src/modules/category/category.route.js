const express = require('express');
const { authenticate, authorize } = require('../../middlewares/auth');
const {
  validate,
  validateParams,
} = require('../../validators/common.validator');
const CategoryController = require('./category.controller');
const {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
} = require('./category.validator');

const router = express.Router();
const controller = new CategoryController();

router.post(
  '/',
  authenticate,
  authorize(['ADMIN']),
  validate(createCategorySchema),
  controller.createCategory,
);

router.get('/', controller.getCategories);

router.get(
  '/:id',
  validateParams(categoryIdParamSchema),
  controller.getCategoryById,
);

router.patch(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  validateParams(categoryIdParamSchema),
  validate(updateCategorySchema),
  controller.updateCategory,
);

router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  validateParams(categoryIdParamSchema),
  controller.deleteCategory,
);

module.exports = router;
