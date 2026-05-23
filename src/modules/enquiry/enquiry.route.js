const express = require('express');
const {
  authenticate,
  authorize,
  optionalAuthenticate,
} = require('../../middlewares/auth');
const {
  validate,
  validateParams,
  validateQuery,
} = require('../../validators/common.validator');
const EnquiryController = require('./enquiry.controller');
const {
  createEnquirySchema,
  updateEnquirySchema,
  enquiryIdParamSchema,
  enquiryFilterQuerySchema,
} = require('./enquiry.validator');

const router = express.Router();
const controller = new EnquiryController();

router.post(
  '/',
  optionalAuthenticate,
  validate(createEnquirySchema),
  controller.createEnquiry,
);

router.get(
  '/',
  authenticate,
  authorize(['ADMIN', 'VENDOR']),
  validateQuery(enquiryFilterQuerySchema),
  controller.getEnquiries,
);

router.get(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'VENDOR']),
  validateParams(enquiryIdParamSchema),
  controller.getEnquiryById,
);

router.patch(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'VENDOR']),
  validateParams(enquiryIdParamSchema),
  validate(updateEnquirySchema),
  controller.updateEnquiry,
);

router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'VENDOR']),
  validateParams(enquiryIdParamSchema),
  controller.deleteEnquiry,
);

module.exports = router;
