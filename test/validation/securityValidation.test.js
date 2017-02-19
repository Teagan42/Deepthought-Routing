'use strict';

const Chai = require('chai');
const expect = Chai.expect;
const securityValidation = require('../../src/validation/securityValidation');

describe('#securityValidation', function () {
  describe('invalidates', function () {
    describe('security', function () {
      const req = {};

      it('with missing key', function (done) {
        securityValidation(function () {
            return {}
          }, {
            'api_key': []
          }, req)
          .then(function () {
            done('should have been invalid');
          })
          .catch(function (err) {
            expect(err)
              .to.be.an('Object');

            expect(err)
              .to.have.property('api_key');

            done();
          })
          .catch(done);
      });

      it('with missing permission', function (done) {
        securityValidation(function () {
            return {
              'auth': [
                'auth:write'
              ]
            };
          }, {
            'auth': [
              'auth:write',
              'auth:read'
            ]
          }, req)
          .then(function () {
            done('should have been invalid');
          })
          .catch(function (err) {
            expect(err)
              .to.be.an('Object');

            expect(err)
              .to.have.property('auth');

            done();
          })
          .catch(done);
      });
    });

    describe('authProvider', function () {
      const req = {};

      it('with incorrect resolution type', function (done) {
        securityValidation(function () {
            return false;
          }, {
            'api_key': []
          }, req)
          .then(function () {
            done('should have been invalid');
          })
          .catch(function (err) {
            expect(err)
              .to.be.an('error');

            done();
          })
          .catch(done);
      });

      it('with incorrect promise resultion type', function (done) {
        securityValidation(function () {
            return Promise.resolve(false);
          }, {
            'api_key': []
          }, req)
          .then(function () {
            done('should have been invalid');
          })
          .catch(function (err) {
            expect(err)
              .to.be.an('error');

            done();
          })
          .catch(done);
      });
    });
  });

  describe('validates', function () {
    it('with non-promise resolution type', function (done) {
      securityValidation(function () {
          return {'api_key': []};
        }, {
          'api_key': []
        }, {})
        .then(function () {
          done();
        })
        .catch(done);
    });

    it('with promise resultion type', function (done) {
      securityValidation(function () {
          return Promise.resolve({'api_key': []});
        }, {
          'api_key': []
        }, {})
        .then(function () {
          done();
        })
        .catch(done);
    });

    it('with extra keys', function (done) {
      securityValidation(function () {
          return Promise.resolve({
            'api_key': [],
            'other_key': ['perm']
          });
        }, {
          'api_key': []
        }, {})
        .then(function () {
          done();
        })
        .catch(done);
    });

    it('with extra permissions', function (done) {
      securityValidation(function () {
          return Promise.resolve({
            'api_key': ['perm']
          });
        }, {
          'api_key': []
        }, {})
        .then(function () {
          done();
        })
        .catch(done);
    });
  });
});
