import { FlightData, OpenSkyResponse } from './flight.types';
import { logger } from '../../config/logger';

export class FlightProcessor {
  // Track the same 2 flights consistently for smooth marker updates
  private trackedIcao24s: string[] = [];

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
   * Dynamically selects 2 flights. Tries to keep tracking the same flights
   * across polls for smooth UI updates. If a tracked flight is no longer
   * available (landed, out of range), a new one is picked from the pool.
   */
  public selectDynamicFlights(states: any[][], count: number = 2): any[][] {
    if (states.length <= count) {
      // Update tracked IDs to whatever is available
      this.trackedIcao24s = states.map(s => s[0]);
      return states;
    }

    // Try to find previously tracked flights in the new data
    const stillActive: any[][] = [];
    const remaining: any[][] = [];

    for (const state of states) {
      if (this.trackedIcao24s.includes(state[0])) {
        stillActive.push(state);
      } else {
        remaining.push(state);
      }
    }

    // Fill with tracked flights first, then pick new ones to fill gaps
    const result: any[][] = stillActive.slice(0, count);
    
    if (result.length < count) {
      // Shuffle remaining and fill the gap
      const shuffled = [...remaining].sort(() => 0.5 - Math.random());
      const needed = count - result.length;
      result.push(...shuffled.slice(0, needed));
      
      if (needed > 0) {
        logger.info(`Replaced ${needed} tracked flight(s) with new ones from pool of ${remaining.length}`);
      }
    }

    // Update tracked IDs
    this.trackedIcao24s = result.map(s => s[0]);
    return result;
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
        heading: (state[10] as number) || 0,  // true_track — bearing in degrees
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
    
    logger.debug(`Filtered ${validFlights.length} valid airborne flights from ${states.length} total`);
    
    const selectedFlights = this.selectDynamicFlights(validFlights, 2);
    return this.normalizeFlights(selectedFlights);
  }
}

export const flightProcessor = new FlightProcessor();
