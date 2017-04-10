var config;
var models = [];
var apiModel = require('./apiModel.js');
var logger = require('technicolor-logger');

const swaggerJSDoc = require('swagger-jsdoc');

function getRoutes(req, res) {
    var urls = [];
    var apiRoutes = apiModel.routes;
    for (var route in apiRoutes) {
        if (!apiRoutes[route]) { continue; }
        var url = {};
        url[route] = {
            'description': apiRoutes[route].description
            , 'parameters': apiRoutes[route].parameters
        };

        urls.push(url);
    }

    res.json(urls);
}

function getSwaggerSpec (req, res) {
    var urls = {};
    var apiRoutes = apiModel.routes;
    for (var route in apiRoutes) {
        var currentRoute = apiRoutes[route];
        if (!currentRoute) { continue; }
        let url = {};

        let tempObj = convertRouteToSwaggerDoc(currentRoute);
        let httpVerb = currentRoute['method'];
        if (!urls[currentRoute.pattern]) {
            urls[currentRoute.pattern] = {};
        }
        urls[currentRoute.pattern][httpVerb] = tempObj;
    }

    if (config.swaggerOptions.excludedUris.length) {
        removeExcludedUri(config, urls);
    }
    let swaggerSpec = configureSwaggerOptions(urls);

    res.setHeader('Content-Type', 'application/json');
    res.json(swaggerSpec);
}

function configureSwaggerOptions(urls) {
    // initialize swagger-jsdoc
    let swaggerSpec = swaggerJSDoc(config.swaggerOptions);

    swaggerSpec.paths = urls;
    swaggerSpec.apis = urls;
    swaggerSpec.securityDefinitions =
        {
            userSecurity: {
                type: 'apiKey'
                , in: 'query'
                , name: 'user-api-key'
            }
        };

    return swaggerSpec;
}

function convertRouteToSwaggerDoc(route) {
    let resultObj = {
        'description': route.description ? route.description : ''
        , 'parameters':  Array.isArray(route.parameters) ? route.parameters : []
        , 'responses': route.responses ? route.responses : {}
    };
    if (config.responses) {
      resultObj.responses = config.responses;
    }
    if (route.secured) {
        resultObj.security = { userSecurity : [] };
    }
    return resultObj;
}

function setup(app, cfg) {
    config = cfg || require('../config.json');
    models = config.models || models;

    apiModel.routeRegistered.on('registeredSuccessfully', function(route) {
        preRegisterRoute(route);
        app[route.method](route.pattern, route.handler);
    });

    apiModel.routeRegisteredError.on('registrationError', function(route) {
        throw new Error('Unable to register route:', route);
    });

    setupRoutes();

    return apiModel;
}

function removeExcludedUri(config, urls) {
    config.swaggerOptions.excludedUris.filter(string => {
        let index = string.indexOf('*');
        if (string[index] && '*' === string[index] && string.length > 1) { // if there is an asterisk at end of string and it's not the only character in the string
          // delete if matches before *
            string = string.slice(0, -1);
            Object.keys(urls).filter(url => {
                if (url.match(string)) {
                  delete urls[url];
                }
            });
        }
        delete urls[string];
    });
}

function preRegisterRoute(route) {
    var tempRoute = route;

    if (config.logRouteRegistration) {
        console.log(JSON.stringify(tempRoute));
        logger.info(JSON.stringify(tempRoute));
    }
}

function setupRoutes() {
    for (var prop in models) {
        if (models[prop]) {
            models[prop].init(apiModel);
        }
    }

    if (config.routesUri) {
        apiModel.registerPublicRoute('get', 'displayAvailableRoutes', config.routesUri, getRoutes, null, 'Displays the available routes.');
    }

    if (config.swaggerUri) {
        apiModel.registerPublicRoute('get', 'exportSwaggerJSON', config.swaggerUri, getSwaggerSpec, null, 'Displays Swagger formatted JSON.');
    }
}

exports.setup = setup;
exports.models = models;
