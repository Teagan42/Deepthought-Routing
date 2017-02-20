"use strict";

const Joi = require('joi');

const operationSchema = require('./operationSchema');

module.exports = Joi.object({
  'get': operationSchema.optional(),
  'post': operationSchema.optional(),
  'put': operationSchema.optional(),
  'delete': operationSchema.optional(),
  'options': operationSchema.optional(),
  'head': operationSchema.optional(),
  'patch': operationSchema.optional()
});
