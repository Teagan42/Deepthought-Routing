"use strict";

const Joi = require('joi');

const securitySchema = require('./securitySchema');
const parameterSchema = require('./parameterSchema');

module.exports = Joi.object({
  'tags': Joi.array()
    .items(Joi.string().required()),
  'summary': Joi.string()
    .max(120)
    .required(),
  'description': Joi.string()
    .required(),
  'consumes': Joi.array()
    .items(Joi.string().required()),
  'produces': Joi.array()
    .items(Joi.string().required()),
  'parameters': Joi.array()
    .items(parameterSchema),
  'schemes': Joi.array()
    .items(Joi.string()
      .allow('http', 'https', 'ws', 'wss')),
  'deprecated': Joi.boolean(),
  'security': securitySchema,
  'handler': Joi.func()
});
