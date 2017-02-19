const Joi = require('joi');

module.exports = Joi.object()
  .pattern(
    /.*/,
    Joi.array().items(Joi.string()));
