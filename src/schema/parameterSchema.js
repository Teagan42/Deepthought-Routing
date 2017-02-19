"use strict";

const Joi = require('joi');

module.exports = Joi.object({
  'name': Joi.string()
    .required(),
  'in': Joi.string()
    .valid('query', 'header', 'path', 'formData', 'body')
    .required(),
  'type': Joi.object()
    .keys({
      validate: Joi.func()
    })
    .unknown(),
  'description': Joi.string(),
  'required': Joi.boolean()
    .required()
});
