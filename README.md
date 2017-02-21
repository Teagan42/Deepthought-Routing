# Deepthought-Routing

Enforce best practices onto your API at compile time, utilizing this wrapper on top of the Express framework

# Install
`npm install deepthought-routing`

# Usage
Enter a JSON version of your swagger documentation and it will validate for you!

## Example
```
var rootHandler = require('./routes/root/handler.js');
var accountHandler = require('./routes/accounts/handler.js);
var permissionProvider = require('./services/permissionProvider.js');
var express = require('express');
var app = express();
var Router = require('deepthought-routing');
var Joi = require('joi');

new Router(app)
    .loadSchema({
        title: 'My Api',
        description: 'Example Deepthought Routing',
        contact: {
            name: 'Some BOdy',
            email: 'your@email.com',
            url: 'https://mysite.com'
        },
        permissionProvider: permissionProvider
        paths: {
            '/': {
                'get': {
                    tags: ['Tag','Another', 'Stuff'],
                    summary: 'Root Path',
                    description: 'Example path',
                    consumes: ['application/json'],
                    produces: ['application/json'],
                    schemes: ['http', 'https'],
                    deprecated: false,
                    handler: rootHandler
                }
            },
            '/accounts/:id': {
                'get': {
                    tags: ['Tag','Another', 'Stuff'],
                    summary: 'Get account',
                    description: 'Retrieves an account',
                    consumes: ['application/json'],
                    produces: ['application/json'],
                    schemes: ['http', 'https'],
                    deprecated: false,
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            type: Joi.number(),
                            description: 'Account id',
                            required: true
                        }
                    ],
                    handler: accountHandler.retrieve
                },
                'post': {
                    tags: ['Tag','Another', 'Stuff'],
                    summary: 'Create account',
                    description: 'Makes a new account',
                    consumes: ['application/json'],
                    produces: ['application/json'],
                    schemes: ['http', 'https'],
                    deprecated: false,
                    parameters: [
                        {
                            name: 'name',
                            in: 'body',
                            type: Joi.string(),
                            description: 'Account name',
                            required: true
                        },
                        {
                            name: 'password',
                            in: 'body',
                            type: Joi.string()
                                .min(4)
                                .max(10,
                            description: 'Account password',
                            required: true
                        },
                        {
                            name: 'displayName',
                            in: 'body',
                            type: Joi.string()
                                .max(128),
                            description: 'Account display name',
                            required: false
                        }
                    ],
                    security: {
                        'api_key': [],
                        'account': [
                            'account:write'
                         ]
                    },
                    handler: accountHandler.retrieve
                }
            }
        }
    })
    .listen(3000);

```
## Permissions Handling
Deepthought-Routing is set up to validate the security for each endpoint.

To validate security, a `permissionProvider` is required in the root schema definition.
The permission provider can either:
- Return a promise that resolves to an Object
- Return an Object

The resolution Object of the permissionProvider must match the following schema:
 
```javascript
Joi.object()
  .pattern(
    /.*/,
    Joi.array().items(Joi.string()));
```
This means that the object's key values must be string arrays. It will match this to the
schema passed in to the operation's `security` field.


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

# Notes
- Once the `Router.listen` method is invoked, you may not register any new routes through the router.
- You may invoke `Router.registerRoute(method, path, schema, [handler])` instead of using the monolithic schema.
- The `type` in the operation schema must be a [joi object](https://www.npmjs.com/package/joi)

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
};
```

## Configurable options:
1. Your Documentation's title, version, and description in the ``` swaggerDefinition``` object. Ensure that the ```host``` and ```basePath``` correlate to your API's index route. You may hard-code the ```host```.

2. You may exclude routes from documentation by adding them to the ```excludedUris``` array on the ```swaggerOptions``` object.

3. Your ```swaggerUri``` value is the route at which you may view the JSON formatted for Swagger.

## Viewing Swagger documentation

1. In your ```public``` folder, copy over the ```dist``` folder from https://github.com/swagger-api/swagger-ui and rename it to ```api-docs``` modify the url declaration line in the ```index.html``` line to match the ```swaggerUri``` URL.
```
if (url && url.length > 1) {
        url = decodeURIComponent(url[1]);
      } else {
        url = "/"; // your url here
      }
```
After starting your app, navigate to ```/api-docs``` (ie. http//localhost:3000/swagger) and revel in your automatic documentation creation!


# Selling points

Deepthought will standardize your route registration through a series of decorator style functions that allow you to
declare your routes in the same file that will be implementing the business logic without requiring the express app
to be passed around.

Deepthought also allows you to standardize route security by enforcing secured routes pass through your security
 functions.  To ensure security compliance the configurations are logged out to the console at app launch, allowing you
 and your team the ability to review all routes at once.

Future feature will be the ability to integrate swagger.io documentation directly into your app, so that your documentation
always stays up to date with your code.
