"use strict";

const Express = require("express");

function setupExpress() {
    var app = Express();

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    return app;
}

//http://stackoverflow.com/a/28199817/1765430
function describeRoutes(app) {
    let result = [];

    app._router.stack.forEach(function(middleware) {
        if (middleware.route) { // routes registered directly on the app
            result.push(middleware.route);
        } else if (middleware.name === 'router') { // router middleware
            middleware.handle.stack.forEach(function(handler) {
                const route = handler.route;
                route && result.push(route);
            });
        }
    });

    return result;
}

exports.setupExpress = setupExpress;
exports.describeExpressAppRoutes = describeRoutes;