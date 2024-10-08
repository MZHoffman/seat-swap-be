const format = require('pg-format');
const db = require('../connection');

const seed = async ({
  userData,
  flightData,
  seatData,
  journeyPrefsData,
  seatLocationData,
  seatPositionData,
  airlineData,
  swapData,
  airportData,
}) => {
  try {
    await db.query('DROP TABLE IF EXISTS review CASCADE;');
    await db.query('DROP TABLE IF EXISTS swap CASCADE;');
    await db.query('DROP TABLE IF EXISTS seat CASCADE;');
    await db.query('DROP TABLE IF EXISTS seat_location CASCADE;');
    await db.query('DROP TABLE IF EXISTS seat_position CASCADE;');
    await db.query('DROP TABLE IF EXISTS journey_prefs CASCADE;');
    await db.query('DROP TABLE IF EXISTS flight CASCADE;');
    await db.query('DROP TABLE IF EXISTS default_prefs CASCADE;');
    await db.query('DROP TABLE IF EXISTS "user" CASCADE;');
    await db.query('DROP TABLE IF EXISTS airline CASCADE;');
    await db.query('DROP TABLE IF EXISTS airport CASCADE;');

    await db.query(`
      CREATE TABLE "user" (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255),
        firstname VARCHAR(255),
        lastname VARCHAR(255),
        phone VARCHAR(255),
        password VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE flight (
        id SERIAL PRIMARY KEY,
        flightNumber VARCHAR(255),
        departureAirport VARCHAR(255),
        arrivalAirport VARCHAR(255),
        departureTime VARCHAR(255),
        arrivalTime VARCHAR(255),
        airline VARCHAR(255)
      );
    `);

    await db.query(`
      CREATE TABLE journey_prefs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES "user"(id),
        flight_id INTEGER REFERENCES flight(id),
        legroom_pref BOOLEAN,
        window_pref BOOLEAN,
        middle_pref BOOLEAN,
        aisle_pref BOOLEAN,
        front_pref BOOLEAN,
        center_pref BOOLEAN,
        back_pref BOOLEAN,
        side_by_side_pref BOOLEAN,
        neighbouring_row_pref BOOLEAN,
        same_row_pref BOOLEAN
      );
    `);

    await db.query(`
      CREATE TABLE seat_position (
        id SERIAL PRIMARY KEY,
        position_name VARCHAR(255) UNIQUE NOT NULL
      );
    `);

    await db.query(`
      CREATE TABLE seat_location (
        id SERIAL PRIMARY KEY,
        location_name VARCHAR(255) UNIQUE NOT NULL
      );
    `);

    await db.query(`
      CREATE TABLE seat (
        id SERIAL PRIMARY KEY,
        current_user_id INTEGER REFERENCES "user"(id),
        original_user_id INTEGER REFERENCES "user"(id),
        previous_user_id INTEGER REFERENCES "user"(id) DEFAULT NULL,
        flight_id INTEGER REFERENCES flight(id),
        seat_row SMALLINT,
        seat_letter CHAR(1),
        seat_column SMALLINT,
        legroom BOOLEAN DEFAULT FALSE,
        seat_position_id INTEGER REFERENCES seat_position(id),
        seat_location_id INTEGER REFERENCES seat_location(id)
      );
    `);

    await db.query(`
      CREATE TABLE swap (
        id SERIAL PRIMARY KEY,
        requester_id INTEGER REFERENCES "user"(id),
        respondent_id INTEGER REFERENCES "user"(id),
        requester_seat_id INTEGER,
        respondent_seat_id INTEGER,
        status VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT NULL
      );
    `);

    await db.query(`
      CREATE TABLE review (
        id SERIAL PRIMARY KEY,
        rating INTEGER,
        comment TEXT,
        reviewer_id INTEGER REFERENCES "user"(id),
        reviewed_id INTEGER REFERENCES "user"(id),
        swap_id INTEGER REFERENCES swap(id),
        review_happened BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
    CREATE TABLE airline (
      id SERIAL PRIMARY KEY,
      iata VARCHAR(255),
      icao VARCHAR(255),
      airline VARCHAR(255),
      callsign VARCHAR(255),
      country VARCHAR(255)
    );
    `);

    await db.query(`
      CREATE TABLE airport (
        id SERIAL PRIMARY KEY,
        iata VARCHAR(255),
        name VARCHAR(255),
        city VARCHAR(255),
        subd VARCHAR(255),
        country VARCHAR(255),
        lat DECIMAL,
        lon DECIMAL,
        tz VARCHAR(255)
      );
      `);

    const insertSeatLocationQueryStr = format(
      'INSERT INTO seat_location (location_name) VALUES %L RETURNING *;',
      seatLocationData.map(({ location_name }) => [location_name])
    );

    await db.query(insertSeatLocationQueryStr);

    const insertSeatPositionQueryStr = format(
      'INSERT INTO seat_position (position_name) VALUES %L RETURNING *;',
      seatPositionData.map(({ position_name }) => [position_name])
    );

    await db.query(insertSeatPositionQueryStr);

    const insertUserQueryStr = format(
      'INSERT INTO "user" (email, firstname, lastname, phone, password, created_at) VALUES %L RETURNING *;',
      userData.map(
        ({ email, firstname, lastname, phone, password, created_at }) => [
          email,
          firstname,
          lastname,
          phone,
          password,
          created_at,
        ]
      )
    );

    await db.query(insertUserQueryStr);

    const insertFlightQueryStr = format(
      'INSERT INTO flight (flightNumber, departureAirport, arrivalAirport, departureTime, arrivalTime, airline) VALUES %L RETURNING *;',
      flightData.map(
        ({
          flightNumber,
          departureAirport,
          arrivalAirport,
          departureTime,
          arrivalTime,
          airline,
        }) => [
          flightNumber,
          departureAirport,
          arrivalAirport,
          departureTime,
          arrivalTime,
          airline,
        ]
      )
    );

    await db.query(insertFlightQueryStr);

    const insertSeatQueryStr = format(
      'INSERT INTO seat (current_user_id, original_user_id, previous_user_id, flight_id, legroom, seat_location_id, seat_position_id, seat_row, seat_letter, seat_column) VALUES %L RETURNING *;',
      seatData.map(
        ({
          current_user_id,
          original_user_id,
          previous_user_id,
          flight_id,
          legroom,
          seat_location_id,
          seat_position_id,
          seat_row,
          seat_letter,
          seat_column,
        }) => [
          current_user_id,
          original_user_id,
          previous_user_id,
          flight_id,
          legroom,
          seat_location_id,
          seat_position_id,
          seat_row,
          seat_letter,
          seat_column,
        ]
      )
    );

    await db.query(insertSeatQueryStr);

    const insertJourneyPrefsQueryStr = format(
      'INSERT INTO journey_prefs (user_id, flight_id, legroom_pref, window_pref, middle_pref, aisle_pref, front_pref, center_pref, back_pref, side_by_side_pref, neighbouring_row_pref, same_row_pref) VALUES %L RETURNING *;',
      journeyPrefsData.map(
        ({
          user_id,
          flight_id,
          legroom_pref,
          window_pref,
          middle_pref,
          aisle_pref,
          front_pref,
          center_pref,
          back_pref,
          side_by_side_pref,
          neighbouring_row_pref,
          same_row_pref,
        }) => [
          user_id,
          flight_id,
          legroom_pref,
          window_pref,
          middle_pref,
          aisle_pref,
          front_pref,
          center_pref,
          back_pref,
          side_by_side_pref,
          neighbouring_row_pref,
          same_row_pref,
        ]
      )
    );

    await db.query(insertJourneyPrefsQueryStr);

    const insertAirlineQueryStr = format(
      'INSERT INTO airline (iata, icao, airline, callsign, country) VALUES %L RETURNING *;',
      airlineData.map(({ iata, icao, airline, callsign, country }) => [
        iata,
        icao,
        airline,
        callsign,
        country,
      ])
    );

    await db.query(insertAirlineQueryStr);

    const insertSwapQueryStr = format(
      'INSERT INTO swap (requester_id, respondent_id, requester_seat_id, respondent_seat_id, status, created_at, updated_at) VALUES %L RETURNING *;',
      swapData.map(
        ({
          requester_id,
          respondent_id,
          requester_seat_id,
          respondent_seat_id,
          status,
          created_at,
          updated_at,
        }) => [
          requester_id,
          respondent_id,
          requester_seat_id,
          respondent_seat_id,
          status,
          created_at,
          updated_at,
        ]
      )
    );

    await db.query(insertSwapQueryStr);

    const insertAirportQueryStr = format(
      'INSERT INTO airport (iata, name, city, subd, country, lat, lon, tz) VALUES %L RETURNING *;',
      airportData.map(({ iata, name, city, subd, country, lat, lon, tz }) => [
        iata,
        name,
        city,
        subd,
        country,
        lat,
        lon,
        tz,
      ])
    );

    await db.query(insertAirportQueryStr);
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

module.exports = seed;
