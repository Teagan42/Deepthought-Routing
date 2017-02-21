"use strict";

const Joi = require('joi');

const pathItemSchema = require('./pathItemSchema');

module.exports = Joi.object()
  .pattern(/^\/.*/, pathItemSchema);
