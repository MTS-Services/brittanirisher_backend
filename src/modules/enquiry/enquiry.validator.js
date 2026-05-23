const Joi = require('joi');
const {
  email,
  id,
  name,
  optionalId,
  paginationSchema,
  phone,
} = require('../../validators/common.validator');

const enquiryStatusSchema = Joi.string().valid(
  'NEW',
  'PENDING',
  'REPLIED',
  'IGNORED',
  'CONTRACTED',
);

const createEnquirySchema = Joi.object({
  vendorId: id,
  profileId: optionalId.allow(null, ''),
  senderName: name.required(),
  senderPhone: phone.required(),
  senderEmail: email.required(),
  message: Joi.string().trim().min(1).max(5000).required(),
  status: enquiryStatusSchema.optional(),
});

const updateEnquirySchema = Joi.object({
  vendorId: optionalId,
  profileId: optionalId.allow(null, ''),
  senderName: name.optional(),
  senderPhone: phone.optional(),
  senderEmail: email.optional(),
  message: Joi.string().trim().min(1).max(5000).optional(),
  status: enquiryStatusSchema.optional(),
}).min(1);

const enquiryIdParamSchema = Joi.object({
  id,
});

const enquiryFilterQuerySchema = paginationSchema.keys({
  sortBy: Joi.string().valid('createdAt', 'status', 'senderName').optional(),
  status: enquiryStatusSchema.optional(),
  vendorId: optionalId,
  profileId: optionalId,
});

module.exports = {
  createEnquirySchema,
  updateEnquirySchema,
  enquiryIdParamSchema,
  enquiryFilterQuerySchema,
};
