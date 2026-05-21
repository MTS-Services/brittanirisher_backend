const express = require('express');
const { authenticate, authorize } = require('../../middlewares/auth');
const {
  validate,
  validateParams,
} = require('../../validators/common.validator');
const WeddingStyleController = require('./weddingStyle.controller');
const {
  createWeddingStyleSchema,
  updateWeddingStyleSchema,
  weddingStyleIdParamSchema,
} = require('./weddingStyle.validator');

const router = express.Router();
const controller = new WeddingStyleController();

router.post(
  '/',
  authenticate,
  authorize(['ADMIN']),
  validate(createWeddingStyleSchema),
  controller.createWeddingStyle,
);

router.get('/', controller.getWeddingStyles);

router.get(
  '/:id',
  validateParams(weddingStyleIdParamSchema),
  controller.getWeddingStyleById,
);

router.patch(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  validateParams(weddingStyleIdParamSchema),
  validate(updateWeddingStyleSchema),
  controller.updateWeddingStyle,
);

router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  validateParams(weddingStyleIdParamSchema),
  controller.deleteWeddingStyle,
);

module.exports = router;
