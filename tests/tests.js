require('babel-core/register')({
  ignore: /node_modules/,
});
const mocha = require('mocha');
const chai = require('chai');
const request = require('request-promise');
const expect = chai.expect;
const assert = chai.assert;

// simulate production env for testing
process.env.NODE_ENV = 'production';
process.env.testing = 'true';
const app = require('../server/server.js');

describe('Client Integration Tests', () => {
  let server, port;
  // setup server
  before((next) => {
    server = app.listen(() => {
      port = server.address().port;
      next();
    });
  });

  it('should get food truck data as an array of objects', (done) => {
    request({
      method: 'POST',
      uri: 'http://localhost:' + port + '/api/sfFoodTrucks',
      json: true,
      body: {
      },
    })
      .then((response) => {
        expect(response).to.exist;
        expect(response).to.be.an.instanceof(Array);
        expect(response[0]).to.be.an.instanceof(Object);
        expect(response[0]).to.have.any.keys('address', 'dayshours', 'latitude', 'longitude', 'fooditems', 'applicant', 'schedule');
        done();
      })
      .catch((error) => {
        expect(error).to.not.exist;
        done();
      });
  });

  after('Close server connection', () => {
    server.close();
  });
});
