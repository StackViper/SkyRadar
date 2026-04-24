import axios, { AxiosInstance } from 'axios';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { CONSTANTS } from '../../shared/constants';
import { OpenSkyResponseSchema, OpenSkyResponse } from './flight.types';
import { APIConnectionError } from '../../shared/errors';

export class FlightService {
  private client: AxiosInstance;
  public retryAfterSeconds: number | null = null; // Exposed for scheduler to read

  constructor() {
    // Build axios instance with optional Basic Auth
    const axiosConfig: any = {
      baseURL: env.OPENSKY_URL,
      timeout: CONSTANTS.POLLING_TIMEOUT_MS,
    };

    // OpenSky supports Basic Auth for higher rate limits (4,000 credits/day vs 400)
    if (env.OPENSKY_USERNAME && env.OPENSKY_PASSWORD) {
      axiosConfig.auth = {
        username: env.OPENSKY_USERNAME,
        password: env.OPENSKY_PASSWORD,
      };
      logger.info('OpenSky Basic Auth ENABLED (4,000 credits/day)');
    } else {
      logger.warn('OpenSky authentication DISABLED — using anonymous mode (400 credits/day). Set OPENSKY_USERNAME and OPENSKY_PASSWORD for 10x more credits.');
    }

    this.client = axios.create(axiosConfig);
  }

  public async fetchLiveFlights(): Promise<OpenSkyResponse> {
    try {
      // Create abort controller for request timeout cancellation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONSTANTS.POLLING_TIMEOUT_MS);

      const response = await this.client.get('', {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Log remaining credits if header is present
      const remaining = response.headers['x-rate-limit-remaining'];
      if (remaining) {
        logger.debug(`API credits remaining: ${remaining}`);
      }

      // Reset retry-after on success
      this.retryAfterSeconds = null;

      // Validate with Zod
      const validatedData = OpenSkyResponseSchema.parse(response.data);
      return validatedData;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        logger.error('Request canceled due to timeout');
        throw new APIConnectionError('OpenSky API Timeout');
      }

      // Detect rate-limiting (HTTP 429)
      if (error.response && error.response.status === 429) {
        // Read the exact retry-after duration from API headers
        const retryAfter = error.response.headers['x-rate-limit-retry-after-seconds']
          || error.response.headers['retry-after'];
        if (retryAfter) {
          this.retryAfterSeconds = parseInt(retryAfter, 10);
          logger.warn(`OpenSky API rate limit hit (429). API says retry after ${this.retryAfterSeconds}s`);
        } else {
          this.retryAfterSeconds = null;
          logger.warn('OpenSky API rate limit hit (429). Backing off...');
        }
        const rateLimitErr = new APIConnectionError('Rate limited by OpenSky API');
        (rateLimitErr as any).isRateLimited = true;
        throw rateLimitErr;
      }
      
      logger.error('Error fetching data from OpenSky API', { error: error.message });
      throw new APIConnectionError(error.message);
    }
  }
}

export const flightService = new FlightService();
