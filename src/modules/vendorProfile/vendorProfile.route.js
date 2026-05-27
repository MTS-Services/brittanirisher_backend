const express = require('express');
const { authenticate, authorize } = require('../../middlewares/auth');
const {
  validate,
  validateParams,
  validateQuery,
} = require('../../validators/common.validator');
const upload = require('../../middlewares/upload');
const VendorProfileController = require('./vendorProfile.controller');
const {
  createVendorProfileSchema,
  updateVendorProfileSchema,
  vendorProfileIdParamSchema,
  vendorFilterQuerySchema,
} = require('./vendorProfile.validator');
const packageParseMiddleware = require('./vendorProfile.parseData');

const router = express.Router();
const controller = new VendorProfileController();

// Public routes
router.get(
  '/',
  validateQuery(vendorFilterQuerySchema),
  controller.getVendorProfiles,
);

router.get('/search', controller.searchVendorProfiles);

router.get(
  '/:id',
  validateParams(vendorProfileIdParamSchema),
  controller.getVendorProfileById,
);

// Authenticated vendor routes
router.post(
  '/',
  upload.array('images', 10),
  packageParseMiddleware(),
  validate(createVendorProfileSchema),
  controller.createVendorProfile,
);

router.get(
  '/my/profile',
  authenticate,
  authorize(['VENDOR']),
  controller.getMyVendorProfile,
);

router.patch(
  '/update',
  authenticate,
  authorize(['VENDOR', 'ADMIN']),
  upload.array('images', 10),
  packageParseMiddleware(),
  validate(updateVendorProfileSchema),
  controller.updateVendorProfile,
);

router.delete(
  '/:id',
  authenticate,
  // authorize(['VENDOR', 'ADMIN']),
  validateParams(vendorProfileIdParamSchema),
  controller.deleteVendorProfile,
);

// Portfolio Image Routes
router.post(
  '/:id/cover-image',
  authenticate,
  authorize(['VENDOR', 'ADMIN']),
  validateParams(vendorProfileIdParamSchema),
  upload.single('image'),
  controller.uploadCoverImage,
);

router.get(
  '/:id/portfolio',
  validateParams(vendorProfileIdParamSchema),
  controller.getPortfolioImages,
);

router.post(
  '/:id/portfolio',
  authenticate,
  authorize(['VENDOR', 'ADMIN']),
  validateParams(vendorProfileIdParamSchema),
  upload.single('image'),
  controller.uploadPortfolioImage,
);

router.post(
  '/:id/portfolio/bulk',
  authenticate,
  authorize(['VENDOR', 'ADMIN']),
  validateParams(vendorProfileIdParamSchema),
  upload.array('images', 10),
  controller.uploadPortfolioImages,
);

router.delete(
  '/portfolio/:imageId',
  authenticate,
  authorize(['VENDOR', 'ADMIN']),
  controller.deletePortfolioImage,
);

router.patch(
  '/:id/portfolio/reorder',
  authenticate,
  authorize(['VENDOR', 'ADMIN']),
  validateParams(vendorProfileIdParamSchema),
  controller.reorderPortfolioImages,
);

module.exports = router;
