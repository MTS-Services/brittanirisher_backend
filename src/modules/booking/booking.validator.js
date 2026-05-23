const Joi = require('joi');
const {
  email,
  id,
  name,
  paginationSchema,
  phone,
  optionalId,
} = require('../../validators/common.validator');

const bookingStatusSchema = Joi.string().valid(
  'BOOKED',
  'COMPLETED',
  'CANCELED',
);

const createBookingSchema = Joi.object({
  // vendorId: id,
  coupleName: name.required(),
  email: email.required(),
  phone: phone.required(),
  venueName: Joi.string().trim().min(2).max(200).required(),
  location: Joi.string().trim().min(2).max(200).required(),
  weddingDate: Joi.date().required(),
  price: Joi.number().positive().required(),
  packageId: id,
  status: bookingStatusSchema.optional(),
});

const updateBookingSchema = Joi.object({
  vendorId: optionalId,
  coupleName: name.optional(),
  email: email.optional(),
  phone: phone.optional(),
  venueName: Joi.string().trim().min(2).max(200).optional(),
  location: Joi.string().trim().min(2).max(200).optional(),
  weddingDate: Joi.date().optional(),
  price: Joi.number().positive().optional(),
  packageId: optionalId,
  status: bookingStatusSchema.optional(),
}).min(1);

const bookingIdParamSchema = Joi.object({
  id,
});

const bookingFilterQuerySchema = paginationSchema.keys({
  sortBy: Joi.string()
    .valid('createdAt', 'updatedAt', 'weddingDate', 'price')
    .optional(),
  status: bookingStatusSchema.optional(),
  vendorId: optionalId,
  packageId: optionalId,
  fromDate: Joi.date().optional(),
  toDate: Joi.date().optional(),
});

module.exports = {
  createBookingSchema,
  updateBookingSchema,
  bookingIdParamSchema,
  bookingFilterQuerySchema,
};
