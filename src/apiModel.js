"use strict";

let curry = require('curry');
let EventEmitter = require('events').EventEmitter;
let registeredRoute = new EventEmitter();
let registeredRouteError = new EventEmitter();
let enforceLeadingSlash = false;
let enforceTrailingSlash = false;
let authenticationHandlers = [];

const PUBLIC = "public"
const SECURED = "secured"
const ADMINISTRATION = {
        SYSTEM: "systemAdministration"
      , USER: "userAdministration"
    };
const VALID_METHODS = [
        'GET'
      , 'PUT'
      , 'POST'
      , 'DELETE'
    ];

var routes = {};

function getPrePattern(urlPattern) {
    if (urlPattern === "/") return urlPattern;
    return enforceLeadingSlash && !urlPattern.match(/^\//) ? '/' : '';
}

function getPostPattern(urlPattern) {
    return enforceTrailingSlash && !urlPattern.match(/\[\/\]$/) ? '[/]?' : '';
}

function applyPatternSettings(urlPattern) {
    var prePattern = getPrePattern(urlPattern);
    var postPattern = getPostPattern(urlPattern);
    return prePattern + (urlPattern ? urlPattern.replace(/\/$/, '') + postPattern : '');
}

var registerRoute = curry(function(securityLevel, category, method, name, urlPattern, handler, parameters, description) {
    var enforcedPattern = applyPatternSettings(urlPattern);
    var routeKey = method + ':' + enforcedPattern;
    var isSecured = securityLevel === SECURED;

    var route = {
        "secured": isSecured
        , "category": category
        , "method": method.toLowerCase()
        , "name": name
        , "pattern": enforcedPattern
        , "handler": isSecured ? authenticationHandlers.concat([handler]) : [handler]
        , "parameters": parameters
        , "description": description
    };

    if (routes[routeKey] || !route.method || VALID_METHODS.indexOf(route.method.toUpperCase()) === -1) {
        registeredRouteError.emit('registrationError', route);
        return;
    }

    routes[routeKey] = route;

    registeredRoute.emit('registeredSuccessfully', route);
});

const registerPublicRoute        = registerRoute(PUBLIC, null);
const registerAuthenticatedRoute = registerRoute(SECURED, null);
const registerSystemAdminRoute   = registerRoute(SECURED, ADMINISTRATION.SYSTEM);
const registerUserAdminRoute     = registerRoute(SECURED, ADMINISTRATION.USER);

//Configuration
exports.addAuthenticationHandler = (x) => {authenticationHandlers.push(x)};

//Methods
exports.registerPublicRoute                 = registerPublicRoute;
exports.registerSecuredRoute                = registerAuthenticatedRoute;
exports.registerSystemAdministrationRoute   = registerSystemAdminRoute;
exports.registerUserAdministrationRoute     = registerUserAdminRoute;

//Signals
exports.routeRegistered      = registeredRoute;
exports.routeRegisteredError = registeredRouteError;

//State
exports.routes               = routes;
exports.enforceLeadingSlash  = enforceLeadingSlash;
exports.enforceTrailingSlash = enforceTrailingSlash;

exports.applyPatternSettings = applyPatternSettings;
