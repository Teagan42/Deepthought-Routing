"use strict";

const Joi = require('joi');

const contactSchema = require('./contactSchema');
const licenseSchema = require('./licenseSchema');
const pathsSchema = require('./pathsSchema');

module.exports = Joi.object({
  'title': Joi.string()
    .required(),
  'description': Joi.string(),
  'termsOfService': Joi.string(),
  'contact': contactSchema.required(),
  'license': licenseSchema,
  'paths': pathsSchema
});
