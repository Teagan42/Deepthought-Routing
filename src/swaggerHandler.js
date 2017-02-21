"use strict";

const curry = require('curry');
const HttpError = require('http-errors');
const _ = require('underscore');

const convertParameter = (parameter) => {
  const paramCopy = _.clone(parameter);
  paramCopy.type = paramCopy.type.name;

  return paramCopy;
};

const removeHandler = (operation) => {
  const opCopy = _.clone(operation);

  if (opCopy.handler) {
    delete opCopy.handler;
  }

  return opCopy;
};

const removePermissionProvider = (info) => {
  const infoCopy = _.clone(info);

  if (infoCopy.permissionProvider) {
    delete infoCopy.permissionProvider;
  }

  return infoCopy;
};

module.exports = curry((schema, req, res, next) => {
  if (!schema) {
    return next(new HttpError.InternalServerError('No swagger schema defined'));
  }

  const swagDoc = removePermissionProvider(schema);

  if (swagDoc.paths) {
    const paths = {};
    Object.keys(swagDoc.paths)
      .forEach((pattern) => {
        const newPath = {};
        const path = swagDoc.paths[pattern];

        Object.keys(path)
          .forEach((method) => {
            const op = path[method];

            if (op.parameters) {
              const newParams = [];
              op.parameters
                .forEach((param) => {
                  newParams.push(convertParameter(param));
                });

              op.parameters = newParams;
            }

            newPath[method] = op;
          });

        paths[pattern] = path;
      });

    swagDoc.paths = paths;
  }

  res.status(200)
    .json(swagDoc);
});
