let supertest = require('supertest');
const baseUrl = 'http://localhost:5791/';

const endPoint = supertest(baseUrl);

module.exports = endPoint;