"use strict";

const HttpError = require('http-errors');

module.exports = (mimeTypes) => {
  if (!(mimeTypes instanceof Array)) {
    throw new TypeError('MimeTypes must be an Array');
  }

  return (req, res, next) => {
    // req.is()
    if (!req.accepts(mimeTypes)) {
      return next(new HttpError.NotAcceptable('Unacceptable MimeType'));
    }

    return next();
  };
};
