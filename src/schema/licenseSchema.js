"use strict";

const Joi = require('joi');

module.exports = Joi.object({
  'name': Joi.string()
    .required(),
  'url': Joi.string()
    .uri({
      allowRelative: false
    })
    .required(),
});
