export const formatSpeed = (speed: number) => {
  // Speed is likely m/s from OpenSky. Convert to km/h or knots.
  // Converting to km/h for readability.
  return `${(speed * 3.6).toFixed(0)} km/h`;
};

export const formatAltitude = (altitude: number) => {
  return `${Math.round(altitude)} m`;
};
