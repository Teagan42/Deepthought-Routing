'use strict';

const Joi = require('joi');
const Chai = require('chai');
const expect = Chai.expect;
const Router = require('../src/router');

describe('#Router', () => {
  describe('constructor', () => {
    describe('errors', () => {
      it('with no express app passed', () => {
        expect(() => {
            new Router(null);
          })
          .to.throw(TypeError);
      });

      it('with invalid permission provider', () => {
        const app = require('express')();
        expect(() => {
            new Router(app, null, 'hello');
          })
          .to.throw(TypeError);
      });
    });

    describe('config', () => {
      let app = null;

      beforeEach('load express', () => {
        app = require('express')()
      });

      it('loads default', () => {
        const defaultConfg = require('../config.json');

        const router = new Router(app);

        expect(router._options.enforceLeadingSlash)
          .to.equal(defaultConfg.enforceLeadingSlash);

        expect(router._options.enforceTrailingSlash)
          .to.equal(defaultConfg.enforceTrailingSlash);
      });

      it('does not load default', () => {
        const config = {
          enforceLeadingSlash: false,
          enforceTrailingSlash: true
        };

        const router = new Router(app, config);

        expect(router._options.enforceLeadingSlash)
          .to.equal(config.enforceLeadingSlash);

        expect(router._options.enforceTrailingSlash)
          .to.equal(config.enforceTrailingSlash);
      });
    });
  });

  describe('registerRoute', () => {
    let app = null;

    const express = require('express');

    beforeEach('load express', () => {
      app = express();
    });

    describe('errors', () => {
      let router = null;

      beforeEach('load router', () => {
        router = new Router(app);
      });

      it('with null route schema', () => {
        const registerRoute = () => {
          router.registerRoute('get', '/', null, null);
        };
        expect(registerRoute).to.throw(Error);
      });

      it('with empty route schema', () => {
        const registerRoute = () => {
          router.registerRoute('get', '/', {}, null);
        };
        expect(registerRoute).to.throw(Error);
      });

      it('with duplicate routes', () => {
        const registerRoute = () => {
          router.registerRoute('GET', '/', {
            'summary': 'Test Route',
            'description': 'Test Route'
          }, null);
        };

        expect(registerRoute).to.not.throw(Error);
        expect(registerRoute).to.throw(Error);
      });

      it('with incorrect method', () => {
        const registerRoute = () => {
          router.registerRoute('FAKE', '/', {
            'summary': 'Test Route',
            'description': 'Test Route'
          }, null);
        };

        expect(registerRoute).to.throw(Error);
      });
    });

    describe('succeeds', () => {
      let router = null;

      beforeEach('setup router', () => {
        router = new Router(require('express')());
      });

      it('with one route', () => {
        const registerRoute = () => {
         router.registerRoute('get', '/', {
           'summary': 'Root',
           'description': 'Root path'
         });
        };

        expect(registerRoute).to.not.throw(Error);
        expect(router._routes)
          .to.be.an('Object');
        expect(Object.keys(router._routes).length)
          .to.equal(1);
      });

      it('with two routes', () => {
        const registerRoute = (path) => {
          return () => {
            router.registerRoute('get', path, {
              'summary': 'Root',
              'description': 'Root path'
            });
          };
        };

        expect(registerRoute('/'))
          .to.not.throw(Error);
        expect(registerRoute('/another'))
          .to.not.throw(Error);
      });

      it('with two routes, different methods', () => {
        const registerRoute = (method, path) => {
          return () => {
            router.registerRoute('get', path, {
              'summary': 'Root',
              'description': 'Root path'
            });
          };
        };

        expect(registerRoute('get', '/'))
          .to.not.throw(Error);
        expect(registerRoute('post', '/another'))
          .to.not.throw(Error);
      });

      it('with one route, different methods', () => {
        const registerRoute = (method) => {
          return () => {
            router.registerRoute(method, '/', {
              'summary': 'Root',
              'description': 'Root path'
            });
          };
        };

        expect(registerRoute('get'))
          .to.not.throw(Error);
        expect(registerRoute('post'))
          .to.not.throw(Error);
      });
    });
  });

  describe('invalidates', () => {
    describe('missing', () => {
      const request = require('supertest');

      let router = null;
      let next = null;

      beforeEach('setup router', () => {
        router = new Router(require('express')());
        router.registerRoute('get', '/:id', {
            'summary': 'Test',
            'description': 'Handle Test',
            'parameters': [
              {
                'in': 'path',
                'name': 'id',
                'type': Joi.number(),
                'required': true,
                'description': 'Id'
              },
              {
                'in': 'query',
                'name': 'name',
                'type': Joi.string(),
                'required': false,
                'description': 'Name'
              }
            ],
            'security': {
              'api_key': [],
              'auth': [
                'write'
              ]
            }
          }, (res, req, next) => {
            return res.send(req);
          });
      });

      it('security key', (done) => {
        const permProvider = () => {
          return {
            'api_key': []
          };
        };

        next = (data) => {
          expect(data)
            .to.be.an('Error');
        };

        router.setPermissionProvider(permProvider);

        request(router._expressApp)
          .get('/1')
          .end((err, res) => {
            //noinspection BadExpressionStatementJS
            expect(err)
              .to.be.null;

            expect(res)
              .to.be.an('Object');
            expect(res.status)
              .to.equal(401);

            done();
          });
      });

      it('security key permission', (done) => {
        const permProvider = () => {
          return {
            'api_key': [],
            'auth': [
              'read'
            ]
          };
        };

        router.setPermissionProvider(permProvider)
          .listen();

        request(router._expressApp)
          .get('/1')
          .end((err, res) => {
            //noinspection BadExpressionStatementJS
            expect(err)
              .to.be.null;

            expect(res)
              .to.be.an('Object');
            expect(res.status)
              .to.equal(401);

            done();
          });
      });

      it('incorrect parameter type', (done) => {
        const permProvider = () => {
          return {
            'api_key': [],
            'auth': [
              'write'
            ]
          };
        };

        router.setPermissionProvider(permProvider)
          .listen();

        request(router._expressApp)
          .get('/abc')
          .end((err, res) => {
            //noinspection BadExpressionStatementJS
            expect(err)
              .to.be.null;

            expect(res)
              .to.be.an('Object');
            expect(res.status)
              .to.equal(400);

            done();
          });
      });
    });
  });

  describe('swagger', () => {
    const request = require('supertest');
    const schema = {
      title: 'Test',
      description: 'Test',
      contact: {
        name: 'Test App',
        url: 'http://google.com',
        email: 'test@test.com'
      },
      paths: {
        '/': {
          get: {
            summary: 'Test Get',
            description: 'Test get handler',
            handler: (res, req, next) => {}
          }
        }
      }
    };
    let router = null

    beforeEach('setup router', () => {
      router = new Router(require('express')(), {
        swaggerOptions: {
          uri: '/swagger',
          excludedUris: []
        }
      }, schema);
      router.listen();
    });

    it('should return swagger doc', (done) => {
      request(router._expressApp)
        .get('/swagger')
        .end((err, res) => {
          try {
            expect(!err)
              .to.equal(true);

            expect(res)
              .to.be.an('Object');

            expect(res.body)
              .to.be.an('Object');
            console.log(res);

            expect(res.body.info)
              .to.be.an('Object');

            expect(res.body.info)
              .to.have.property('title');

            expect(res.body.info)
              .to.have.property('description');

            expect(res.body.info)
              .to.have.property('contact');

            expect(res.body)
              .to.have.property('paths');

            done();
          }
          catch (err) {
            done(err);
          }
        });
    });
  });

  describe('load schema', () => {
    let router = null

    beforeEach('setup router', () => {
      router = new Router(require('express')());
    });

    describe('errors', () => {
      it('with invalid schema', () => {
        const loadSchema = () => router.loadSchema({});

        expect(loadSchema)
          .to.throw(TypeError);
      });
    });

    describe('succeeds', () => {
      it('with empty schema', () => {
        const loadSchema = () => router.loadSchema();

        expect(loadSchema)
          .to.not.throw(Error);

        expect(router.schema)
          .to.be.an('Object');

        expect(Object.keys(router.schema).length)
          .to.equal(0);
      });

      it('with permission provider', () => {
        const loadSchema = () => router.loadSchema({
          title: 'Test',
          description: 'Test description',
          contact: {
            name: 'Test Person',
            url: 'http://google.com',
            email: 'test@test.com'
          },
          permissionProvider: () => {}
        });

        expect(loadSchema)
          .to.not.throw(Error);

        expect(router._permissionProvider)
          .to.be.a('function');
      });

      it('with paths', () => {
        const loadSchema = () => router.loadSchema({
          title: 'Test',
          description: 'Test description',
          contact: {
            name: 'Test Person',
            url: 'http://google.com',
            email: 'test@test.com'
          },
          paths: {
            '/': {
              get: {
                summary: 'Test get',
                description: 'Test endpoint'
              }
            },
            '/:id': {
              post: {
                summary: 'Test Post',
                description: 'Test endpoint'
              }
            }
          }
        });

        expect(loadSchema)
          .to.not.throw(Error);

        expect(router._routes)
          .to.be.an('Object');

        expect(Object.keys(router._routes).length)
          .to.equal(2);

        Object.keys(router._routes)
          .forEach((pattern) => {
            expect(router._routes[pattern])
              .to.be.an('Object');
            expect(router._routes[pattern].handler)
              .to.be.an('Array');
            router._routes[pattern].handler
              .forEach((handler) => {
                expect(handler)
                  .to.be.a('function');
              });
          });
      });
    });
  });

  describe('validates', () => {
    const request = require('supertest');
    const permProvider = () => {
      return {
        'api_key': [],
        'auth': [
          'write'
        ]
      };
    };
    let router = null;

    describe('with security', () => {

      beforeEach('setup router', () => {
        router = new Router(require('express')());
        router.registerRoute('get', '/:id', {
            'summary': 'Test',
            'description': 'Handle Test',
            'parameters': [
              {
                'in': 'path',
                'name': 'id',
                'type': Joi.number(),
                'required': true,
                'description': 'Id'
              },
              {
                'in': 'query',
                'name': 'name',
                'type': Joi.string(),
                'required': false,
                'description': 'Name'
              }
            ],
            'security': {
              'api_key': [],
              'auth': [
                'write'
              ]
            }
          }, (req, res, next) => {
            if (req.query && req.query.name) {
              expect(req.query.name)
                .to.be.a('string');
              expect(req.query.name)
                .to.equal('Bob');
            }

            return res.status(200).send();
          })
          .setPermissionProvider(permProvider)
          .listen();
      });

      it('required fields', (done) => {
        request(router._expressApp)
          .get('/5')
          .end((err, res) => {
           try {
             //noinspection BadExpressionStatementJS
             expect(err)
               .to.be.null;

             expect(res)
               .to.be.an('Object');
             expect(res.status)
               .to.equal(200);

             done();
           }
           catch (e) {
             done(e);
           }
          });
      });

      it('optional fields', (done) => {
        request(router._expressApp)
          .get('/5?name=Bob')
          .end((err, res) => {
            try {
              //noinspection BadExpressionStatementJS
              expect(err)
                .to.be.null;

              expect(res)
                .to.be.an('Object');
              expect(res.status)
                .to.equal(200);

              done();
            }
            catch (e) {
              done(e);
            }
          });
      });
    });

    describe('without security', () => {
      beforeEach('setup router', () => {
        router = new Router(require('express')());
        router.registerRoute('get', '/:id', {
          'summary': 'Test',
          'description': 'Handle Test',
          'parameters': [
            {
              'in': 'path',
              'name': 'id',
              'type': Joi.number(),
              'required': true,
              'description': 'Id'
            },
            {
              'in': 'query',
              'name': 'count',
              'type': Joi.number(),
              'required': false,
              'description': 'Count'
            }
          ]
        }, (req, res, next) => {
          if (req.query && req.query.name) {
            expect(req.query.count)
              .to.be.a('number');
            expect(req.query.count)
              .to.equal(42);
          }

          return res.status(200).send();
        })
          .setPermissionProvider(permProvider)
          .listen();
      });

      it('required fields', (done) => {
        request(router._expressApp)
          .get('/5')
          .end((err, res) => {
            try {
              //noinspection BadExpressionStatementJS
              expect(err)
                .to.be.null;

              expect(res)
                .to.be.an('Object');
              expect(res.status)
                .to.equal(200);

              done();
            }
            catch (e) {
              done(e);
            }
          });
      });

      it('optional fields', (done) => {
        request(router._expressApp)
          .get('/5?count=42')
          .end((err, res) => {
            try {
              //noinspection BadExpressionStatementJS
              expect(err)
                .to.be.null;

              expect(res)
                .to.be.an('Object');
              expect(res.status)
                .to.equal(200);

              done();
            }
            catch (e) {
              done(e);
            }
          });
      });
    });
  });
});
