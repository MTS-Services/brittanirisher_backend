const express = require('express');
const { authenticate, authorize } = require('../../middlewares/auth');
const {
  validate,
  validateParams,
} = require('../../validators/common.validator');
const SaveVendorController = require('./saveVendor.controller');
const { saveVendorSchema } = require('./saveVendor.validator');

const router = express.Router();
const controller = new SaveVendorController();

router.post(
  '/',
  authenticate,
  authorize(['COUPLE']),
  validate(saveVendorSchema),
  controller.toggleSave,
);

router.get('/', authenticate, authorize(['COUPLE']), controller.getSaveVendor);

module.exports = router;
