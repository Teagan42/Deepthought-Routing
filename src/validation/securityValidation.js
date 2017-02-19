const securitySchema = require('../schema/securitySchema');
const _ = require('underscore');

// Verify result from authProvider
const verifyAuthProviderResult = function (permissions) {
  const result = securitySchema.validate(permissions);

  return result.error
    ? Promise.reject(result.error)
    : Promise.resolve(result.value);
};

// Verify permissions callback
const verifyPermissions = function (securitySchema, permissions) {
  const errors = {};
  var isInvalid = false;

  // Iterate over required security keys
  _.forEach(_.keys(securitySchema), function (key) {
    const s = securitySchema[key];

    if (key in permissions) {
      if (!(s instanceof Array)) {
        // If it's not an array - we will assume you just need the security key
        return;
      }

      if (!s.length || _.difference(s, permissions[key]).length === 0) {
        // We found the required permissions for this security key
        return;
      }
    }

    // Apparently we do not have this permission, adding
    errors[key] = 'Missing Permission for ' + key;
    isInvalid = true;
  });

  return isInvalid
    ? Promise.reject(errors)
    : Promise.resolve(true);
};

module.exports = function (authProvider, securitySchema, req, res, next) {
  if (!securitySchema || !Object.keys(securitySchema).length) {
    // No security defined, resolve
    return Promise.resolve({});
  }

  // Guarantee req exists and has proper pieces of info.
  const context = {};
  _.forEach(['header', 'body', 'query', 'params'], function (inReq) {
    context[inReq] = context[inReq] || {};
  });

  // Get the authentication result from the provider
  const authResult = authProvider(req);

  // Verify permissions either through promise or sync. call
  if (authResult instanceof Promise) {
    return authResult
      .then(verifyAuthProviderResult)
      .then(function (permissions) {
        return verifyPermissions(securitySchema, permissions);
      });
  }
  else {
    return verifyAuthProviderResult(authResult)
      .then(function (permissions) {
        return verifyPermissions(securitySchema, permissions);
      });
  }
};
