'use strict';

const Chai = require('chai');
const expect = Chai.expect;
const parameterValidation = require('../../src/validation/parameterValidation');
const Joi = require('joi');

describe('Verify that', function() {

  describe('invalidates', function () {
    it('with missing request and required field', function () {
      const result =
        parameterValidation({
            'in': 'path',
            'type': Joi.number(),
            'name': 'id',
            'required': true
          });

      expect(result)
        .to.be.an('Object');

      expect(result.id)
        .to.be.a('string');
    });

    it('with missing required field context', function () {
      const result =
        parameterValidation({
            'in': 'path',
            'type': Joi.number(),
            'name': 'id',
            'required': true
          },
          {
            query: {}
          });

      expect(result)
        .to.be.an('Object');

      expect(result.id)
        .to.be.a('string');
    });

    it('with missing required field', function () {
      const result =
        parameterValidation({
            'in': 'path',
            'type': Joi.number(),
            'name': 'id',
            'required': true
          },
          {
            path: {}
          });

      expect(result)
        .to.be.an('Object');

      expect(result.id)
        .to.be.a('string');
    });

    it('with incorrect field type', function () {
      const result =
        parameterValidation({
          'in': 'path',
          'type': Joi.object(),
          'name': 'id',
          'required': true
        });

      expect(result)
        .to.be.an('Object');

      expect(result.id)
        .to.be.a('string');
    });
  });

  describe('it errors', function () {
    const req = {
      path: {
        id: 42
      }
    };

    it('with missing schema props', function () {
      expect(function () {
        parameterValidation({
          'in': 'path',
          'type': Joi.number()
        }, req);
      }).to.throw(TypeError);
    });

    it('with incorrect schema props', function () {
      expect(function () {
        parameterValidation({
          'in': 'path',
          'type': Joi.number(),
          'name': function () { },
          'required': true
        }, req);
      }).to.throw(TypeError);
    });

    it('with no schema', function () {
      expect(function () {
        parameterValidation(null, req);
      }).to.throw(TypeError);
    });
  });

  describe('it converts', function () {
    const schema = {
      'in': 'path',
      'name': 'id',
      'required': true
    };

    it('to a number', function () {
      schema.type = Joi.number();
      const req = {
        path: {
          id: '1234'
        }
      };
      const validation = parameterValidation(
        schema,
        req
      );

      expect(validation)
        .to.be.a('boolean');

      expect(validation)
        .to.be.true;

      expect(req.path.id)
        .to.be.a('number');

      expect(req.path.id)
        .to.equal(1234);
    });

    it('to a date', function () {
      schema.type = Joi.date();
      const req = {
        path: {
          id: '1943-04-16 00:00:000'
        }
      };
      const validation = parameterValidation(
        schema,
        req
      );

      expect(validation)
        .to.be.a('boolean');

      expect(validation)
        .to.be.true;

      expect(req.path.id)
        .to.be.a('Date');

      expect(req.path.id.toString())
        // I hate that month is 0-index
        .to.equal(new Date(1943, 3, 16).toString());
    });

    // it('to a string', function () {
    //   schema.type = Joi.string();
    //   const req = {
    //     path: {
    //       id: 42
    //     }
    //   };
    //   const validation = parameterValidation(
    //     schema,
    //     req
    //   );
    //
    //   expect(validation)
    //     .to.be.a('boolean');
    //
    //   expect(validation)
    //     .to.be.true;
    //
    //   expect(req.path.id)
    //     .to.be.a('string');
    //
    //   expect(req.path.id.toString())
    //     .to.equal('42');
    // });
  });

  describe('it pulls', function() {

    const req = {
      body: {
        'createdDate': new Date()
      },
      query: {
        'name': 'Jimmy'
      },
      path: {
        'id': 52
      },
      header: {
        'X-Token': 12345
      }
    };

    it('from query', function () {
      const validation = parameterValidation({
          'in': 'query',
          'type': Joi.string(),
          'name': 'name',
          'required': true
        },
        req);

      expect(validation)
        .to.be.a('boolean');

      expect(validation)
        .to.be.true;

      expect(req.query.name)
        .to.be.a('string');
    });

    it('from path', function () {
      const validation = parameterValidation({
          'in': 'path',
          'type': Joi.number(),
          'name': 'id',
          'required': true
        },
        req);

      expect(validation)
        .to.be.a('boolean');

      expect(validation)
        .to.be.true;

      expect(req.path.id)
        .to.be.a('number');
    });

    it('from body', function () {
      const validation = parameterValidation({
          'in': 'body',
          'type': Joi.date(),
          'name': 'createdDate',
          'required': true
        },
        req);

      expect(validation)
        .to.be.a('boolean');

      expect(validation)
        .to.be.true;

      expect(req.body.createdDate)
        .to.be.a('Date');
    });

    it('from header', function () {
      const validation = parameterValidation({
        'in': 'header',
        'type': Joi.number(),
        'name': 'X-Token',
        'required': true
      }, req);

      expect(validation)
        .to.be.a('boolean');

      expect(validation)
        .to.be.true;

      expect(req.header['X-Token'])
        .to.be.a('number');
    });
  });
});
