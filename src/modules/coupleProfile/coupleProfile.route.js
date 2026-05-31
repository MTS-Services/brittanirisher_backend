const express = require('express');
const { authenticate, authorize } = require('../../middlewares/auth');
const { validate } = require('../../validators/common.validator');
const CoupleProfileController = require('./coupleProfile.controller');
const {
  createCoupleProfileSchema,
  updateCoupleProfileSchema,
} = require('./coupleProfile.validator');
const CoupleParseMiddleware = require('./coupleProfileParseData');
const upload = require('../../middlewares/upload');

const router = express.Router();
const controller = new CoupleProfileController();

router.post(
  '/',
  validate(createCoupleProfileSchema),
  controller.createCoupleProfile,
);

router.get(
  '/',
  authenticate,
  authorize(['ADMIN', 'COUPLE']),
  controller.getAllCoupleProfiles,
);

router.get(
  '/dashboard',
  authenticate,
  authorize(['COUPLE']),
  controller.getCoupleProfileDashboard,
);

router.get(
  '/my',
  authenticate,
  authorize(['COUPLE']),
  controller.getCoupleProfileByMe,
);

router.get(
  '/:id',
  authenticate,
  authorize(['COUPLE']),
  controller.getCoupleProfileById,
);

router.patch(
  '/update',
  authenticate,
  authorize(['COUPLE']),
  upload.single('images'),
  CoupleParseMiddleware(),
  validate(updateCoupleProfileSchema),
  controller.updateCoupleProfile,
);

router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  controller.deleteCoupleProfile,
);

module.exports = router;
