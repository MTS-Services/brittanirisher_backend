const express = require('express');
const { authenticate, authorize } = require('../../middlewares/auth');
const vendorPackageController = require('./vendorPackage.controller');
const VendorPackageValidation = require('./vendorPackage.validator');
const { validate } = require('../../validators/common.validator');

const router = express.Router();
const controller = new vendorPackageController();
const vendorPackageValidation = new VendorPackageValidation();

router.post(
  '/',
  authenticate,
  authorize(['VENDOR']),
  validate(vendorPackageValidation.create),
  controller.createVendorPackage,
);

router.get(
  '/',
  authenticate,
  authorize(['VENDOR']),
  controller.getAllVendorPackages,
);

router.get(
  '/:id',
  authenticate,
  authorize(['VENDOR']),
  controller.getVendorPackageById,
);

router.patch(
  '/:id',
  authenticate,
  authorize(['VENDOR']),
  validate(vendorPackageValidation.update),
  controller.updateVendorPackage,
);

router.delete(
  '/:id',
  authenticate,
  authorize(['VENDOR']),
  controller.deleteVendorPackage,
);

module.exports = router;
