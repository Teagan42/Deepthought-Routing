var curry = require('curry');
var EventEmitter = require('events').EventEmitter;
var   registeredRoute = new EventEmitter()
    , registeredRouteError = new EventEmitter();
var   enforceLeadingSlash = false
    , enforceTrailingSlash = false;

const PUBLIC = "public"
    , SECURED = "secured"
    , ADMINISTRATION = {
        SYSTEM: "systemAdministration"
      , USER: "userAdministration"
    },
    VALID_METHODS = [
        'GET'
      , 'PUT'
      , 'POST'
      , 'DELETE'
    ];

var routes = {};

function getPrePattern(urlPattern) {
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
    var route = {
        "secured": securityLevel === SECURED
        , "category": category
        , "method": method.toLowerCase()
        , "name": name
        , "pattern": enforcedPattern
        , "handler": handler
        , "parameters": parameters
        , "description": description
    };

    if (routes[routeKey]) {
        registeredRouteError.emit('registrationError', route);
        return;
    }

    routes[routeKey] = route;

    registeredRoute.emit('registeredSuccessfully', route);
});

const registerPublicRoute = registerRoute(PUBLIC, null);
const registerAuthenticatedRoute = registerRoute(SECURED, null);
const registerSystemAdminRoute = registerRoute(SECURED, ADMINISTRATION.SYSTEM);
const registerUserAdminRoute = registerRoute(SECURED, ADMINISTRATION.USER);

//Methods
exports.registerPublicRoute                 = registerPublicRoute;
exports.registerSecuredRoute                = registerAuthenticatedRoute;
exports.registerSystemAdministrationRoute   = registerSystemAdminRoute;
exports.registerUserAdministrationRoute     = registerUserAdminRoute;

//Signals
exports.routeRegistered = registeredRoute;
exports.routeRegisteredError = registeredRouteError;

//State
exports.routes = routes;exports.enforceLeadingSlash  = enforceLeadingSlash;
exports.enforceTrailingSlash = enforceTrailingSlash;