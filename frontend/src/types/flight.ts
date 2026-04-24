export interface Flight {
  icao24: string;
  callsign: string;
  longitude: number;
  latitude: number;
  altitude: number;
  velocity: number;
  vertical_rate: number;
  heading?: number;
  timestamp?: number;
}

export type ConnectionStatus = 'OFFLINE' | 'CONNECTING' | 'LIVE' | 'RECONNECTING';

export interface WebSocketPayload {
  type: 'flight_update';
  timestamp: number;
  flights: Flight[];
}
