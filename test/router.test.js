'use strict';

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

    });
  });
});
