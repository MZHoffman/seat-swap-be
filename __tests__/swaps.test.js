const { app } = require('../app');
const request = require('supertest');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data/index.js');
const moment = require('moment');

beforeEach(() => seed(data));
afterAll(() => db.end());

describe('POST /api/swap', () => {
  const payload = {
    offered_seat_id: 453,
    requested_seat_id: 454,
  };
  test('200: Creates a new swap and responds with the relevant seat ids and swap request date', () => {
    const result = {
      offered_seat_id: 453,
      requested_seat_id: 454,
      swap_request_date: moment().format('YYYY-MM-DD HH'),
    };
    return request(app)
      .post('/api/swap')
      .send(payload)
      .expect(200)
      .then(({ body }) => {
        body.swap_request_date = moment(body.swap_request_date).format(
          'YYYY-MM-DD HH'
        );
        expect(body).toMatchObject(result);
      });
  });

  test('400: Responds with a bad request for posting an existing swap', () => {
    const payload = {
      offered_seat_id: 453,
      requested_seat_id: 452,
    };
    return request(app)
      .post('/api/swap')
      .send(payload)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Swap already exists');
      });
  });
  test('400: Responds with a bad request for a non-existent offered_seat_id', () => {
    const payload = {
      offered_seat_id: 238239,
      requested_seat_id: 452,
    };
    return request(app)
      .post('/api/swap')
      .send(payload)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Seat id not found');
      });
  });
  test('400: Responds with a bad request for a non-existent requested_seat_id', () => {
    const payload = {
      offered_seat_id: 453,
      requested_seat_id: 238239,
    };
    return request(app)
      .post('/api/swap')
      .send(payload)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Seat id not found');
      });
  });
});

describe('PATCH /api/swap/:swapid', () => {
  const payload = {
    action: 'approve',
  };
  test('200: Responds with relevant seat ids and swap approval date', () => {
    const result = {
      offered_seat_id: 453,
      requested_seat_id: 452,
      swap_approval_date: moment().format('YYYY-MM-DD HH'),
    };
    return request(app)
      .patch('/api/swap/1')
      .send(payload)
      .expect(200)
      .then(({ body }) => {
        body.swap_approval_date = moment(body.swap_approval_date).format(
          'YYYY-MM-DD HH'
        );
        expect(body).toMatchObject(result);
      });
  });
  test('400: Responds with a bad request for updating a non existent swap', () => {
    const payload = {
      action: 'approve',
    };
    return request(app)
      .patch('/api/swap/34543')
      .send(payload)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Swap does not exist');
      });
  });
  test('200: Responds with relevant seat ids and swap rejected status true', () => {
    const payload = {
      action: 'reject',
    };
    const result = {
      offered_seat_id: 453,
      requested_seat_id: 452,
      rejection: true,
    };
    return request(app)
      .patch('/api/swap/1')
      .send(payload)
      .expect(200)
      .then(({ body }) => {
        expect(body).toMatchObject(result);
      });
  });
  test('200: Responds with relevant seat ids and cancelled status true', () => {
    const payload = {
      action: 'cancel',
    };
    const result = {
      offered_seat_id: 453,
      requested_seat_id: 452,
      cancelled: true,
    };
    return request(app)
      .patch('/api/swap/1')
      .send(payload)
      .expect(200)
      .then(({ body }) => {
        expect(body).toMatchObject(result);
      });
  });
});

describe('GET /api/swap/yourseat/:yourseatid/matched/:matchedseatid', () => {
  test('200: Responds with request action if no swaps found for provided seat ids', () => {});
});

// api/swap/ (POST with payload of {offered_seat_id and requested_seat_id} returning same ids)
// api/swap/:id (GET Returns the swap and status (either rejected or approval date or))
// api/swap/:id/approve
// api/swap/:id/reject (PATCH for the swap id changing rejected to TRUE, in model: check if swap hasn't already been approv)