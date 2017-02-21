'use strict';

const Chai = require('chai');
const expect = Chai.expect;
const securityValidation = require('../../src/validation/securityValidation');

describe('#securityValidation', () => {
  describe('invalidates', () => {
    describe('security', () => {
      const req = {};

      it('with missing key', (done) => {
        securityValidation(() => {
            return {}
          }, {
            'api_key': []
          }, req)
          .then(() => {
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

      it('with missing permission', (done) => {
        securityValidation(() => {
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
          .then(() => {
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

    describe('authProvider', () => {
      const req = {};

      it('with incorrect resolution type', (done) => {
        securityValidation(() => {
            return false;
          }, {
            'api_key': []
          }, req)
          .then(() => {
            done('should have been invalid');
          })
          .catch(function (err) {
            expect(err)
              .to.be.an('error');

            done();
          })
          .catch(done);
      });

      it('with incorrect promise resultion type', (done) => {
        securityValidation(() => {
            return Promise.resolve(false);
          }, {
            'api_key': []
          }, req)
          .then(() => {
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

  describe('validates', () => {
    it('with non-promise resolution type', (done) => {
      securityValidation(() => {
          return {'api_key': []};
        }, {
          'api_key': []
        }, {})
        .then(() => {
          done();
        })
        .catch(done);
    });

    it('with promise resultion type', (done) => {
      securityValidation(() => {
          return Promise.resolve({'api_key': []});
        }, {
          'api_key': []
        }, {})
        .then(() => {
          done();
        })
        .catch(done);
    });

    it('with extra keys', (done) => {
      securityValidation(() => {
          return Promise.resolve({
            'api_key': [],
            'other_key': ['perm']
          });
        }, {
          'api_key': []
        }, {})
        .then(() => {
          done();
        })
        .catch(done);
    });

    it('with extra permissions', (done) => {
      securityValidation(() => {
          return Promise.resolve({
            'api_key': ['perm']
          });
        }, {
          'api_key': []
        }, {})
        .then(() => {
          done();
        })
        .catch(done);
    });
  });
});
