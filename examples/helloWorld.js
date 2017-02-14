// Adapted from https://github.com/expressjs/expressjs.com/blob/gh-pages/en/starter/hello-world.md?_ga=1.61231726.379606664.1474218809

var express = require('express');
var app = express();
var deepthought = require('../index.js');

var apiModel = deepthought.setup(app);

apiModel.registerPublicRoute(
    'get'
    , 'Hello World Example Route'
    , '/'
    , function(req, res, next) { res.send('Hello World'); next();}
    , [{}]
    , 'This sample route is designed to meet all your hello world API needs.');

app.listen(5000, function () {
  console.log('Example app listening on port 5000!');
});
