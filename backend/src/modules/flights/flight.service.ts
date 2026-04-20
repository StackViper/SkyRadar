import axios, { AxiosInstance } from 'axios';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { CONSTANTS } from '../../shared/constants';
import { OpenSkyResponseSchema, OpenSkyResponse } from './flight.types';
import { APIConnectionError } from '../../shared/errors';

export class FlightService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.OPENSKY_URL,
      timeout: CONSTANTS.POLLING_TIMEOUT_MS,
    });
  }

  public async fetchLiveFlights(): Promise<OpenSkyResponse> {
    try {
      // Create abort controller for request timeout cancellation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONSTANTS.POLLING_TIMEOUT_MS);

      const response = await this.client.get('', {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Validate with Zod
      const validatedData = OpenSkyResponseSchema.parse(response.data);
      return validatedData;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        logger.error('Request canceled due to timeout');
        throw new APIConnectionError('OpenSky API Timeout');
      }
      
      logger.error('Error fetching data from OpenSky API', { error: error.message });
      throw new APIConnectionError(error.message);
    }
  }
}

export const flightService = new FlightService();
