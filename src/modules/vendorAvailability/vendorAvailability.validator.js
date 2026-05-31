const Joi = require('joi');
const {
  id,
  optionalId,
  paginationSchema,
} = require('../../validators/common.validator');

const availabilityStatusSchema = Joi.string().valid('BOOKED', 'UNAVAILABLE');

const createVendorAvailabilitySchema = Joi.object({
  vendorId: optionalId,
  blockedDate: Joi.date().required(),
  status: availabilityStatusSchema.required(),
});

const updateVendorAvailabilitySchema = Joi.object({
  blockedDate: Joi.date().optional(),
  status: availabilityStatusSchema.optional(),
}).min(1);

const vendorAvailabilityIdParamSchema = Joi.object({
  id,
});

const vendorAvailabilityFilterQuerySchema = paginationSchema.keys({
  sortBy: Joi.string().valid('blockedDate', 'createdAt', 'status').optional(),
  vendorId: optionalId,
  status: availabilityStatusSchema.optional(),
  fromDate: Joi.date().optional(),
  toDate: Joi.date().optional(),
});

const availabilityCalendarQuerySchema = Joi.object({
  vendorId: id,
  year: Joi.number().integer().min(2000).required(),
  month: Joi.number().integer().min(1).max(12).required(),
});

const bulkUpdateSchema = Joi.array()
  .items(
    Joi.object({
      date: Joi.date().iso().required().messages({
        'date.base': 'Invalid date format. Use YYYY-MM-DD',
        'any.required': 'Date is required for each availability item',
      }),
      status: Joi.string()
        .valid('AVAILABLE', 'UNAVAILABLE', 'BOOKED')
        .required()
        .messages({
          'any.only': 'Status must be either AVAILABLE, UNAVAILABLE, or BOOKED',
          'any.required': 'Status is required',
        }),
      note: Joi.string().allow('', null).max(500),
    }),
  )
  .min(1)
  .messages({
    'array.min': 'You must provide at least one availability slot to update',
  });

const setMonthlyAvailabilitySchema = Joi.object({
  vendorId: optionalId,
  year: Joi.number().integer().min(2000).max(2100).required(),
  month: Joi.number().integer().min(1).max(12).required(),
  days: Joi.array()
    .items(
      Joi.object({
        blockedDate: Joi.date().required(),
        status: availabilityStatusSchema.required(),
      }),
    )
    .required(),
});

module.exports = {
  createVendorAvailabilitySchema,
  updateVendorAvailabilitySchema,
  vendorAvailabilityIdParamSchema,
  vendorAvailabilityFilterQuerySchema,
  availabilityCalendarQuerySchema,
  setMonthlyAvailabilitySchema,
  bulkUpdateSchema,
};
