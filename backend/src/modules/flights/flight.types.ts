import { z } from 'zod';

// Raw response array from OpenSky API
// [0] icao24, [1] callsign, [2] origin_country, [3] time_position, 
// [4] last_contact, [5] longitude, [6] latitude, [7] baro_altitude, 
// [8] on_ground, [9] velocity, [10] true_track, [11] vertical_rate,
// [12] sensors, [13] geo_altitude, [14] squawk, [15] spi, [16] position_source
export const OpenSkyFlightSchema = z.array(z.any());

export const OpenSkyResponseSchema = z.object({
  time: z.number(),
  states: z.array(OpenSkyFlightSchema).nullable(),
});

export type OpenSkyResponse = z.infer<typeof OpenSkyResponseSchema>;

export interface FlightData {
  id: string;
  callsign: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  verticalRate: number;
  trend: 'CLIMBING' | 'DESCENDING' | 'LEVEL';
}
