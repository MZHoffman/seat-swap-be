

function getPositionName(positionId) {
  if (positionId === 1) return 'window';
  if (positionId === 2) return 'middle';
  if (positionId === 3) return 'aisle';
}
function getLocationName(locationId) {
  if (locationId === 1) return 'front';
  if (locationId === 2) return 'center';
  if (locationId === 3) return 'back';
}

function formatSeatsReturn(seats) {
  return seats.map((seat) => {
    return{
      id: seat.id,
      number: seat.number,
      extraLegroom: seat.legroom,
      location: getLocationName(seat.seat_location_id),
      position: getPositionName(seat.seat_position_id),
    }
  });
}

function getPositionId(positionName) {
  if (positionName === 'window') return 1;
  if (positionName === 'middle') return 2;
  if (positionName === 'aisle') return 3;
}
function getLocationId(locationName) {
  if (locationName === 'front') return 1;
  if (locationName === 'center') return 2;
  if (locationName === 'back') return 3;
}

function formatSeatsQuery(seats, user_id, flight_id) {
  return seats.map((seat) => {
    return{
    user_id: Number(user_id),
    flight_id: Number(flight_id),
    number: seat.number,
    legroom: seat.extraLegroom,
    seat_position_id: getPositionId(seat.position),
    seat_location_id: getLocationId(seat.location),
  }
})
}


module.exports = {
  formatSeatsReturn,
  formatSeatsQuery
}