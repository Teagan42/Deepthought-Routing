"use strict";

const HttpError = require('http-errors');
const Express = require('express');
const EventEmitter = require('events').EventEmitter;

const operationSchema = require('./schema/operationSchema');
const securityValidation = require('./validation/securityValidation');
const parameterValidation = require('./validation/parameterValidation');

class Router {
  /**
   * @return {string}
   */
  static get REGISTRATION_ERROR() {
    return 'registrationError';
  }

  /**
   * @return {string}
   */
  static get REGISTRATION_SUCCESS() {
    return 'registeredSuccessfully';
  }

  get logger() {
    return this._options.logger;
  }

  subscribe(event, listener) {
    this._events.on(event, listener);

    return this;
  }

  constructor(expressApp, config, permissionProvider) {
    if (!expressApp) {
      throw new TypeError('Express app is required to listen router.');
    }

    this._isLoaded = false;

    this.setPermissionProvider(permissionProvider);

    this._options = config || require('../config.json');
    this._options.logger = this._options.logger || require('technicolor-logger');

    this._expressApp = expressApp;
    this._permissionProvider = permissionProvider;
    this._routes = {};

    this._events = new EventEmitter();
    this._events.on(Router.REGISTRATION_SUCCESS, (route) => {
      this.preRegisterRoute(route);
      this._expressApp[route.method](route.pattern, route.handler);
    });
    this._events.on(Router.REGISTRATION_ERROR, (route) => {
      if (route instanceof Error) {
        throw route;
      }

      throw new Error(`Unable to register route: ${JSON.stringify(route)}`);
    });
  }

  getPrePattern(urlPattern) {
    if (urlPattern === "/") return urlPattern;
    return this._options.enforceLeadingSlash && !urlPattern.match(/^\//) ? '/' : '';
  };

  getPostPattern(urlPattern) {
    return this._options.enforceTrailingSlash && !urlPattern.match(/\[\/]$/) ? '[/]?' : '';
  };

  applyPatternSettings(urlPattern) {
    const prePattern = this.getPrePattern(urlPattern);
    const postPattern = this.getPostPattern(urlPattern);
    return prePattern + (urlPattern ? urlPattern.replace(/\/$/, '') + postPattern : '');
  };

  preRegisterRoute(route) {
    if (this._options.logRouteRegistration) {
      this.logger.info(JSON.stringify(route));
    }
  };

  setPermissionProvider(permissionProvider) {
    if (permissionProvider && typeof permissionProvider !== 'function') {
      throw new TypeError('Permission provider must be a function');
    }

    this._permissionProvider = permissionProvider;

    return this;
  }

  registerRoute(method, pattern, routeSchema, handler) {
    if (this._isLoaded) {
      throw new Error('Cannot add route to a loaded router.');
    }
    const route = {
      method: method.toLowerCase(),
      pattern: pattern,
      schema: routeSchema || {},
    };

    const routeKey = `${method}:${pattern}`;

    const schemaSpec = operationSchema.validate(route.schema);
    const error = [];
    if (schemaSpec.error) {
      error.push(schemaSpec.error);
    }
    if (routeKey in this._routes){
      error.push(`Duplicate route ${routeKey}`);
    }
    if (!this._expressApp[route.method]) {
      error.push(`Incorrect method ${route.method}`);
    }

    if (error.length) {
      route.errors = error;
      return this._events.emit(Router.REGISTRATION_ERROR, route);
    }

    route.schema = schemaSpec.value;
    const handlers = [];

    if (route.schema) {
      if (route.schema.security && Object.keys(route.schema.security).length) {
        // Secured route - add security check
        handlers.push(
          (req, res, next) => {
            securityValidation(
                this._permissionProvider,
                route.schema.security,
                req)
              .then(() => {
                next();
              })
              .catch((err) => {
                return next(new HttpError.Unauthorized(JSON.stringify(err)));
              });
          });
      }

      if (route.schema.parameters && route.schema.parameters.length) {
        // Has parameters - add parameter check
        handlers.push(
          (req, res, next) => {
            const errors = {};

            try {
              route.schema.parameters
                .forEach((param) => {
                  const result = parameterValidation(param, req);

                  if (result !== true) {
                    return next(new HttpError.BadRequest(JSON.stringify(result)));
                  }

                  return next();
                });
            }
            catch (err) {
              console.error(err);
              return next(new HttpError.InternalServerError());
            }
          }
        )
      }
    }

    if (handler && typeof handler === 'function') {
      // Actual route handler
      handlers.push(handler);
    }

    route.handler = handlers;

    this._routes[routeKey] = route;

    this._events.emit(Router.REGISTRATION_SUCCESS, route);

    return this;
  }

  listen(port) {
    this._isLoaded = true;
    this._expressApp.use((err, req, res, next) => {
      if (err.statusCode) {
        res = res.status(err.status);
      }
      return res.send(err.message);
    });

    if (port) {
      this._expressApp.listen(port);
    }
  }
}

module.exports = Router;
