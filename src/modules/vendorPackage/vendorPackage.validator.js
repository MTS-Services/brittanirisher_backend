const Joi = require('joi');

class VendorPackageValidation {
  create = Joi.object({
    packageName: Joi.string().trim().min(3).max(100).required().messages({
      'string.min': 'Package name must be at least 3 characters long',
      'any.required': 'Package name is required',
    }),
    price: Joi.number().positive().precision(2).required().messages({
      'number.positive': 'Price must be a positive number',
      'any.required': 'Price is required',
    }),
    badge: Joi.string().trim().max(50).allow(null, ''),
    shortDescription: Joi.string().trim().max(500).allow(null, ''),
    features: Joi.alternatives()
      .try(Joi.array().items(Joi.string()), Joi.object())
      .required()
      .messages({
        'any.required': 'Features are required',
      }),
  });

  update = Joi.object({
    packageName: Joi.string().trim().min(3).max(100).optional(),
    price: Joi.number().positive().precision(2).optional(),
    badge: Joi.string().trim().max(50).allow(null, ''),
    shortDescription: Joi.string().trim().max(500).allow(null, ''),
    features: Joi.alternatives()
      .try(Joi.array().items(Joi.string()), Joi.object())
      .optional(),
  })
    .min(1)
    .messages({
      'object.min': 'At least one field must be provided for update',
    });
}

module.exports = VendorPackageValidation;
