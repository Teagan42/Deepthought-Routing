# Deepthought-Routing

Enforce best practices onto your API at compile time, utilizing this wrapper on top of the Express framework

# Usage

```

var express = require('express');
var app = express();
var deepthought = require('../index.js');

var apiModel = deepthought.setup(app);

apiModel.registerPublicRoute(
    'get'
    , 'Hello World Example Route'
    , '/'
    , function(req, res, next) { res.send('Hello World'); next();}
    , [] // this is an array of parameter objects, see below
    , 'This sample route is designed to meet all your hello world API needs.');

app.listen(5000, function () {
  console.log('Example app listening on port 5000!');
});


```
## Optional Parameter objects
For Swagger to generate documentation for the array of parameters, the documentation needs the following structure:

```
[
  {
      name: "parameter name"
    , description: "optional description"
    , type: string, integer, etc.
    , required: boolean
    , format: optional
    , in: "query"
  }
]
```
For more documentation see: http://swagger.io/specification/#parameterObject

If no parameters, this must be an empty array.


# Optional Swagger UI Implementation

You can opt to include swagger documentation in your application.  This option automatically generates Swagger formatted JSON with the creation of new routes using Deepthought-Routing's route patterns.

In your app.js file, include the following code beneath the require statements.

```
let swaggerDefinition = {
  info: {
    title: 'Your Swagger Documentation Title',
    version: '0.0.0',
    description: 'A Fancy Description',
  }
  , swagger: "2.0"
  , host: app.get((req, res) => { return req.url })
  , basePath: '/'
};

// options for the swagger docs
let swaggerOptions = {
    swaggerDefinition: swaggerDefinition
  , excludedUris: ['/routes', '/']
  , apis: []
};

const routeConfig = {
      "enforceTrailingSlash": true
    , "enforceLeadingSlash": true
    , "logRouteRegistration": true
    , "routesUri": '/routes'
    , "swaggerUri": "/"
    , "swaggerOptions": swaggerOptions
    , models: routes.models
    , responses: {
        200: {
            description: ok
        }
    }
};
```

## Configurable options:
1. Your Documentation's title, version, and description in the ``` swaggerDefinition``` object. Ensure that the ```host``` and ```basePath``` correlate to your API's index route. You may hard-code the ```host```.

2. You may exclude routes from documentation by adding them to the ```excludedUris``` array on the ```swaggerOptions``` object.
    1. You may exclude a group of routes that start with the same characters (i.e. ```/user/*``` will exclude all routes starting with ```/user/``` and ```/user*``` will exclude all routes starting with ```/user```)

3. Your ```swaggerUri``` value is the route at which you may view the JSON formatted for Swagger.

4. The ```responses``` on the routeConfig object is an object whose keys are the status codes
    1. refer to http://swagger.io/docs/specification/basic-structure/

## Viewing Swagger documentation

1. In your ```public``` folder, copy over the ```dist``` folder from https://github.com/swagger-api/swagger-ui and rename it to ```api-docs``` modify the url declaration line in the ```index.html``` line to match the ```swaggerUri``` URL.
```
if (url && url.length > 1) {
        url = decodeURIComponent(url[1]);
      } else {
        url = "/"; // your url here
      }
```
After starting your app, navigate to ```/api-docs``` (ie. http//localhost:3000/api-docs) and revel in your automatic documentation creation!


# Selling points

Deepthought will standardize your route registration through a series of decorator style functions that allow you to
declare your routes in the same file that will be implementing the business logic without requiring the express app
to be passed around.

Deepthought also allows you to standardize route security by enforcing secured routes pass through your security
 functions.  To ensure security compliance the configurations are logged out to the console at app launch, allowing you
 and your team the ability to review all routes at once.

Future feature will be the ability to integrate swagger.io documentation directly into your app, so that your documentation
always stays up to date with your code.


# Install

npm step here
