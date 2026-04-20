export type Trend = 'CLIMBING' | 'DESCENDING' | 'LEVEL';

export interface Flight {
  id: string;
  callsign: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  verticalRate: number;
  trend: Trend;
}

export interface FlightsUpdatePayload {
  data: Flight[];
  isStale: boolean;
  timestamp: string | null;
}
