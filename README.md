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
    , {}
    , 'This sample route is designed to meet all your hello world API needs.');

app.listen(5000, function () {
  console.log('Example app listening on port 5000!');
});


```

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