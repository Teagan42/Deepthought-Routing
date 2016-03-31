var config;
var models;
var apiModel = require('./apiModel.js');
//var logger = require('../services/logger.js');

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

function setup(app, cfg) {
    config = cfg || require('../config.json');
    models = models || cfg.models;

    apiModel.routeRegistered.on('registeredSuccessfully', function(route) {
        if (!route.method) {
            // throw error
        } else {
            preRegisterRoute(route);
            app[route.method](route.pattern, route.handler);
        }
    });

    apiModel.routeRegisteredError.on('registrationError', function(route) {
        throw new Error('Unable to register route:', route);
    });

    setupRoutes();
}

function preRegisterRoute(route) {
    var tempRoute = route;

    if (config.logRouteRegistration) {
        logger.info(JSON.stringify(tempRoute));
    }
}

function setupRoutes() {
    for (var prop in models) {
        if (models[prop]) {
            models[prop].init(apiModel);
        }
    }
    //Not sure if these should be in this class
    //apiModel.registerPublicRoute('get', 'displayCurrentVersion', '', currentVersion, null, 'Gets the current API version information.');
    apiModel.registerPublicRoute('get', 'displayAvailableRoutes', '/routes/', getRoutes, null, 'Displays the available routes.');
}

exports.setup = setup;
exports.models = models;