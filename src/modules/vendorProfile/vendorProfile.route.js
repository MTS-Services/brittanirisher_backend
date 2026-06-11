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
  updateSubscriptionSchema,
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

router.get(
  '/home',
  validateQuery(vendorFilterQuerySchema),
  controller.getVendorProfilesHomePage,
);

router.get(
  '/couple',
  authenticate,
  authorize(['COUPLE']),
  validateQuery(vendorFilterQuerySchema),
  controller.getVendorProfileCouple,
);

router.get(
  '/admin',
  validateQuery(vendorFilterQuerySchema),
  controller.getVendorProfilesAdmin,
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
  upload.array('images'),
  packageParseMiddleware(),
  validate(createVendorProfileSchema),
  controller.createVendorProfile,
);

router.post(
  '/update-subscription',
  authenticate,
  authorize(['VENDOR']),
  validate(updateSubscriptionSchema),
  controller.updateSubscriptionPlanChange,
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
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'images', maxCount: 200 },
  ]),
  packageParseMiddleware(),
  validate(updateVendorProfileSchema),
  controller.updateVendorProfile,
);

router.patch(
  '/status/:id',
  authenticate,
  authorize(['ADMIN']),
  controller.updateVendorStatus,
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
