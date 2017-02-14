"use strict";

const Chai = require('chai');
const Should = Chai.should();

const Util = require('./testUtil');

describe('Verify that', function() {
	describe('vanilla express', function() {

        it('has no routes', function() {
			let app = Util.setupExpress();
			let routes = Util.describeExpressAppRoutes(app);

			routes.should.have.length(0);
		});

        it('has one route', function() {
            let app = Util.setupExpress();
            let routes;
            app.get('/', function() {} );
            routes = Util.describeExpressAppRoutes(app);
            routes.should.have.length(1);
        });
    });

    describe('deepthought-routing' , function() {
        it('has no routes', function() {
            let app = Util.setupExpress();
            let deepThought = require('../src/apiHandler.js');
            let handler = deepThought.setup(app);

            let routes = Util.describeExpressAppRoutes(app);
            routes.should.have.length(0);
        });
        it('has exactly one route', function() {
            let app = Util.setupExpress();
            let deepThought = require('../src/apiHandler.js');
            let handler = deepThought.setup(app);

            handler.registerPublicRoute('get'
                , ''
                , '/'
                , function() {}
                , [{}]
                , '');

            let routes = Util.describeExpressAppRoutes(app);
            routes.should.have.length(1);
        });
    });

    describe('deepthought coexists peacefully with vanilla express', function() {

        it('has no routes', function() {
            const app = Util.setupExpress();
            const deepThought = require('../src/apiHandler.js');
            const handler = deepThought.setup(app);
            const routes = Util.describeExpressAppRoutes(app);

            routes.should.have.length(0);
        });

        it('will not overwrite existing routes', function() {
            let app = Util.setupExpress();

            app.get('/', function() {} );

            let deepThought = require('../src/apiHandler.js');
            let handler = deepThought.setup(app);

            try {
                handler.registerPublicRoute('get'
                    , ''
                    , '/'
                    , function() {}
                    , [{}]
                    , '');
            } catch(err) {
                let routes;
                routes = Util.describeExpressAppRoutes(app);
                routes.should.have.length(1);
            }
        });

        it('registers two routes', function() {
            let app = Util.setupExpress();

            app.get('/', function() {} );

            let deepThought = require('../src/apiHandler.js');
            let handler = deepThought.setup(app);

            handler.registerPublicRoute('get'
                , ''
                , '/fake'
                , function() {}
                , [{}]
                , '');

            let routes;
            routes = Util.describeExpressAppRoutes(app);
            routes.should.have.length(2);
        });
    });
});
