const { app } = require('../app');
const request = require('supertest');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data/index.js');

beforeEach(() => seed(data));
afterAll(() => db.end());

xdescribe('GET /api/flights/:flightNumber/date/:departureTime', () => {
  test('200: Responds with a with a flight object if it exists in local DB for a given flightNumber and departureTime', () => {
    return request(app)
      .get('/api/flights/FR9336/date/2024-07-14')
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          id: 6,
          flightnumber: 'FR9336',
          departureairport: 'BRS',
          departureairportname: 'Bristol International Airport',
          departureairportcity: 'Bristol',
          arrivalairport: 'GRO',
          arrivalairportname: 'Girona Airport',
          arrivalairportcity: 'Girona',
          departuretime: '2024-07-14T21:40+01:00',
          arrivaltime: '2024-07-15T00:40+02:00',
          airline: 'RYANAIR',
        });
      });
  });
  test('200: Responds with a flightId if it does not exist in local DB but has created flight with Amadeus API response', () => {
    return request(app)
      .get('/api/flights/FR2714/date/2024-09-17')
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          id: 9,
          flightnumber: 'FR2714',
          departureairport: 'ALC',
          departureairportcity: 'Alicante',
          departureairportname: 'Alicante International Airport',
          arrivalairport: 'LGW',
          arrivalairportcity: 'London',
          arrivalairportname: 'London Gatwick Airport',
          departuretime: '2024-08-16T06:50+02:00',
          arrivaltime: '2024-08-16T08:30+01:00',
          airline: 'Ryanair',
        });
      });
  });
  test('404: Responds with an error message for a flight number that Amadeus cannot find', () => {
    return request(app)
      .get('/api/flights/Z0799/date/2024-12-05')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Flight not found');
      });
  });
  test('400: Responds with an error message for a flight with a date from the past', () => {
    return request(app)
      .get('/api/flights/Z0701/date/2023-09-19')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe(
          'Past date entered, please enture current/future date'
        );
      });
  });
  test('400: Responds with an error message for an invalid flight number', () => {
    return request(app)
      .get('/api/flights/HUSDFD/date/2024-09-19')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Invalid flight number');
      });
  });
  test('400: Responds with an error message for an invalid date', () => {
    return request(app)
      .get('/api/flights/FR2714/date/SDFSDFG')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Invalid date');
      });
  });
});
