const Joi = require('joi');

const PARAMETER_SCHEMA = Joi.object(
  {
    'name': Joi.string()
      .required(),
    'in': Joi.any()
      .allow('query', 'header', 'path', 'formData', 'body')
      .required(),
    'type': Joi.object()
      .keys({
        validate: Joi.func()
      })
      .unknown(),
    'description': Joi.string(),
    'required': Joi.boolean()
      .required()
  })
  .unknown();

const validateParameters = function(schema, req) {
  const schemaSpec = PARAMETER_SCHEMA.validate(schema);
  if (schemaSpec.error) {
    throw new TypeError('Schema does not match definition: ' + schemaSpec.error.annotate());
  }

  const error = {};
  var isInvalid = false;

  // This is not valid for request, continue
  if (!schema || !schema.in)
  {
    console.log('This is not part of schema', schema);
    return !isInvalid;
  }

  // Get the context for where the parameter is
  var context = req || {};
  switch (schema.in) {
    case 'body':
    case 'formData':
      context = context.body || {};
      break;
    case 'query':
      context = context.query || {};
      break;
    case 'path':
      context = context.path || {};
      break;
    case 'header':
      context = context.header || {};
      break;
    default:
      break;
  }

  if (schema.required && !context[schema.name]) {
    isInvalid = true;
    error[schema.name] = schema.name + ' is required in ' + schema.in;
  }
  else if (context[schema.name]) {
    const validation = schema.type.validate(context[schema.name]);

    if (validation.error) {
      isInvalid = true;
      error[schema.name] = validation.error.annotate();
    } else {
      context[schema.name] = validation.value;
    }
  }

  return !isInvalid || error;
};

module.exports = validateParameters;
