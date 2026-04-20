import { FlightData, OpenSkyResponse } from './flight.types';
import { logger } from '../../config/logger';

export class FlightProcessor {
  /**
   * Filters raw OpenSky states based on business rules:
   * - on_ground = false
   * - velocity > 50
   * - baro_altitude > 3000
   * - longitude != null
   * - latitude != null
   */
  public filterValidFlights(states: any[][]): any[][] {
    return states.filter((state) => {
      const longitude = state[5];
      const latitude = state[6];
      const baroAltitude = state[7];
      const onGround = state[8];
      const velocity = state[9];

      return (
        onGround === false &&
        velocity > 50 &&
        baroAltitude > 3000 &&
        longitude !== null &&
        latitude !== null
      );
    });
  }

  /**
   * Randomly selects n flights from the pool.
   */
  public selectDynamicFlights(states: any[][], count: number = 2): any[][] {
    if (states.length <= count) return states;
    
    // Shuffle and pick
    const shuffled = [...states].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Normalizes OpenSky array format into clean object structure.
   */
  public normalizeFlights(states: any[][]): FlightData[] {
    return states.map((state) => {
      const verticalRate = state[11] || 0;
      let trend: 'CLIMBING' | 'DESCENDING' | 'LEVEL' = 'LEVEL';
      
      if (verticalRate > 0) trend = 'CLIMBING';
      else if (verticalRate < 0) trend = 'DESCENDING';

      return {
        id: state[0] as string,
        callsign: (state[1] as string || '').trim(),
        longitude: state[5] as number,
        latitude: state[6] as number,
        altitude: state[7] as number,
        speed: state[9] as number,
        verticalRate,
        trend,
      };
    });
  }

  /**
   * Pipeline for processing a raw response.
   */
  public process(data: OpenSkyResponse): FlightData[] {
    if (!data || !data.states) {
      logger.warn('No states returned from OpenSky');
      return [];
    }

    const { states } = data;
    const validFlights = this.filterValidFlights(states);
    const selectedFlights = this.selectDynamicFlights(validFlights, 2);
    return this.normalizeFlights(selectedFlights);
  }
}

export const flightProcessor = new FlightProcessor();
