const Joi = require('joi');

const saveVendorSchema = Joi.object({
  vendorId: Joi.string().trim().required(),
});

module.exports = {
  saveVendorSchema,
};
