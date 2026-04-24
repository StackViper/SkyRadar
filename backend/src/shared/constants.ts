export const CONSTANTS = {
  WEBSOCKET_EVENTS: {
    CONNECT: 'connection',
    DISCONNECT: 'disconnect',
    FLIGHTS_UPDATE: 'flightsUpdate',
  },
  POLLING_TIMEOUT_MS: 15000, // Timeout for the API Request (15s — OpenSky can be slow)
};
