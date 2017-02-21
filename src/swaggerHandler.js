"use strict";

const curry = require('curry');
const HttpError = require('http-errors');
const _ = require('underscore');

const getSwagDoc = (swagDoc, excludedUris) => {
  return {
    swagger: '2.0',
    info: getSwagInfo(swagDoc) || {},
    paths: getSwagPaths(swagDoc.paths, excludedUris)
  };
}

const getSwagInfo = (documentation) => {
  const swagDoc = documentation || {};
  return {
    title: swagDoc.title,
    description: swagDoc.description,
    termsOfService: swagDoc.termsOfService,
    contact: swagDoc.contact,
    liscense: swagDoc.license
  };
};

const getSwagPaths = (pathsDoc, excludedUris) => {
  const swagDoc = pathsDoc || {};
  if (!Object.keys(swagDoc).length) {
    return {};
  }

  const result = {};
  Object.keys(swagDoc)
    .map((pattern) => {
      const newPath = {};
      const path = swagDoc[pattern];

      Object.keys(path)
        .forEach((method) => {
          if (excludedUris && excludedUris.indexOf(path) !== -1) {
            // Exclude this URI
            return;
          }

          newPath[method] = getSwagOperation(path[method]);
        });

      result[pattern] = newPath;
    });

  return result;
};

const getSwagOperation = (operationDoc) => {
  const swagDoc = operationDoc || {};
  if (!swagDoc || !swagDoc.summary) {
    return {};
  }

  return {
    tags: swagDoc.tags || [],
    summary: swagDoc.summary,
    description: swagDoc.description,
    consumes: swagDoc.consumes || [],
    produces: swagDoc.produces || [],
    parameters: getSwagParameters(swagDoc.parameters),
    schemes: swagDoc.schemes || [],
    deprecated: swagDoc.deprecated,
    security: swagDoc.security || []
  };
};

const getSwagParameters = (parameters) => {
  const swagDoc = parameters || [];
  if (!swagDoc.length) {
    return [];
  }

  const result = [];
  swagDoc
    .map((p) => result.push(getSwagParam(p)));

  return result;
};

const getSwagParam = (parameterDoc) => {
  const swagDoc = parameterDoc || {};
  if (!swagDoc.name) {
    return {};
  }

  const param = {
    name: swagDoc.name,
    in: swagDoc.in,
    type: swagDoc.type._type,
    description: swagDoc.description,
    required: swagDoc.required
  };

  return param;
};

module.exports = curry((schema, options, req, res, next) => {
  if (!schema) {
    return next(new HttpError.InternalServerError('No swagger schema defined'));
  }

  const excludedUris = options.excludedUri;

  res.status(200)
    .json(getSwagDoc(schema, excludedUris));
});
