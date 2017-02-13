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

function formatToSwaggerJSON (req, res) {
  var urls = {};
  var apiRoutes = apiModel.routes;
  for (var route in apiRoutes) {
      var currentRoute = apiRoutes[route];
      if (!currentRoute) { continue; }
      var url = {};

      let tempObj = convertRouteToSwaggerDoc(currentRoute);
      let httpVerb = currentRoute['method'];
      tempObj.path = currentRoute.pattern;
      url[httpVerb] = tempObj;
      urls[currentRoute.pattern] = url;
  }

  if (config.swaggerOptions.excludedUris.length) {
    config.swaggerOptions.excludedUris.filter(function (string) {
      delete url[string];
    });
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
      , 'parameters':  route.parameters.length ? route.parameters : []
      , 'responses': route.responses ? route.responses : []
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
        apiModel.registerPublicRoute('get', 'exportSwaggerJSON', config.swaggerUri, formatToSwaggerJSON, null, 'Displays Swagger formatted JSON.');
    }
}

exports.setup = setup;
exports.models = models;
