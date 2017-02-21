'use strict';

const Chai = require('chai');
const expect = Chai.expect;
const parameterValidation = require('../../src/validation/parameterValidation');
const Joi = require('joi');

describe('#parameterValidation', () => {

  describe('invalidates', () => {
    it('with missing request and required field', () => {
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

    it('with missing required field context', () => {
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

    it('with missing required field', () => {
      const result =
        parameterValidation({
            'in': 'path',
            'type': Joi.number(),
            'name': 'id',
            'required': true
          },
          {
           params: {}
          });

      expect(result)
        .to.be.an('Object');

      expect(result.id)
        .to.be.a('string');
    });

    it('with incorrect field type', () => {
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

  describe('errors', () => {
    const req = {
     params: {
        id: 42
      }
    };

    it('with missing schema props', () => {
      expect(() => {
        parameterValidation({
          'in': 'path',
          'type': Joi.number()
        }, req);
      }).to.throw(TypeError);
    });

    it('with incorrect schema props', () => {
      expect(() => {
        parameterValidation({
          'in': 'path',
          'type': Joi.number(),
          'name': () => { },
          'required': true
        }, req);
      }).to.throw(TypeError);
    });

    it('with no schema', () => {
      expect(() => {
        parameterValidation(null, req);
      }).to.throw(TypeError);
    });
  });

  describe('converts', () => {
    const schema = {
      'in': 'path',
      'name': 'id',
      'required': true
    };

    it('to a number', () => {
      schema.type = Joi.number();
      const req = {
        params: {
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

      expect(req.params.id)
        .to.be.a('number');

      expect(req.params.id)
        .to.equal(1234);
    });

    it('to a date', () => {
      schema.type = Joi.date();
      const req = {
        params: {
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

      expect(req.params.id)
        .to.be.a('Date');

      expect(req.params.id.toString())
        // I hate that month is 0-index
        .to.equal(new Date(1943, 3, 16).toString());
    });

    // it('to a string', () => {
    //   schema.type = Joi.string();
    //   const req = {
    //     params: {
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
    //   expect(req.params.id)
    //     .to.be.a('string');
    //
    //   expect(req.params.id.toString())
    //     .to.equal('42');
    // });
  });

  describe('pulls', () => {

    const req = {
      body: {
        'createdDate': new Date()
      },
      query: {
        'name': 'Jimmy'
      },
      params: {
        'id': 52
      },
      header: {
        'X-Token': 12345
      }
    };

    it('from query', () => {
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

    it('from path/params', () => {
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

      expect(req.params.id)
        .to.be.a('number');
    });

    it('from body', () => {
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

    it('from header', () => {
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
