import { flightService } from './flight.service';
import { flightProcessor } from './flight.processor';
import { flightStore } from './flight.store';
import { logger } from '../../config/logger';
import { env } from '../../config/env';
import { SocketGateway } from '../../sockets/socket.gateway';

export class FlightScheduler {
  private isRunning = false;
  private timeoutId: NodeJS.Timeout | null = null;
  private socketGateway: SocketGateway;

  // Rate-limit backoff state
  private consecutiveRateLimits = 0;
  private readonly MAX_BACKOFF_MS = 300000; // Cap at 5 minutes
  private readonly JITTER_MS = 3000; // Random 0-3s jitter to avoid rate-limit edges

  constructor(socketGateway: SocketGateway) {
    this.socketGateway = socketGateway;
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    logger.info('Starting flight polling worker');
    this.poll();
  }

  public stop(): void {
    this.isRunning = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    logger.info('Stopped flight polling worker');
  }

  /**
   * Add random jitter to prevent landing on exact rate-limit boundaries.
   */
  private getJitter(): number {
    return Math.floor(Math.random() * this.JITTER_MS);
  }

  /**
   * Calculate next poll delay.
   * Priority: API-provided retryAfter > exponential backoff > normal interval.
   */
  private getNextDelay(): number {
    // If API told us exactly when to retry, use that
    if (flightService.retryAfterSeconds && flightService.retryAfterSeconds > 0) {
      const apiDelay = flightService.retryAfterSeconds * 1000 + this.getJitter();
      logger.info(`Using API-provided retry delay: ${Math.round(apiDelay / 1000)}s`);
      return apiDelay;
    }

    // Normal polling
    if (this.consecutiveRateLimits === 0) {
      return env.POLL_INTERVAL_MS + this.getJitter();
    }

    // Exponential backoff: 60s, 120s, 240s, capped at 5min
    const backoff = Math.min(
      60000 * Math.pow(2, this.consecutiveRateLimits - 1),
      this.MAX_BACKOFF_MS
    );
    return backoff + this.getJitter();
  }

  private async poll(): Promise<void> {
    if (!this.isRunning) return;

    logger.debug('Polling OpenSky API for flights...');

    try {
      const rawData = await flightService.fetchLiveFlights();
      const newFlights = flightProcessor.process(rawData);
      
      // Update in-memory store
      flightStore.setLatestFlights(newFlights);

      // Reset backoff on success
      if (this.consecutiveRateLimits > 0) {
        logger.info('Rate limit recovered. Resuming normal 10s polling.');
      }
      this.consecutiveRateLimits = 0;
      
      logger.info('Polling success', { 
        selectedFlightsCount: newFlights.length,
      });

      // Broadcast fresh data to all connected clients
      this.socketGateway.broadcastFlights(newFlights);

    } catch (error: any) {
      if (error.isRateLimited) {
        this.consecutiveRateLimits++;
        const nextDelay = this.getNextDelay();
        logger.warn(`Rate limited. Backoff #${this.consecutiveRateLimits}. Next retry in ${Math.round(nextDelay / 1000)}s`);

        // Broadcast cached data so the app stays alive during backoff
        const cachedFlights = flightStore.getLatestFlights();
        if (cachedFlights.length > 0) {
          logger.info('Broadcasting cached flight data to clients during backoff');
          this.socketGateway.broadcastFlights(cachedFlights);
        }
      } else {
        logger.error('Polling failed, using last known good state if available', { error: (error as Error).message });
        
        // Broadcast cached data on any error
        const cachedFlights = flightStore.getLatestFlights();
        if (cachedFlights.length > 0) {
          this.socketGateway.broadcastFlights(cachedFlights);
        }
      }
    } finally {
      // Recursive setTimeout (never overlaps, never starves event loop)
      if (this.isRunning) {
        const delay = this.getNextDelay();
        this.timeoutId = setTimeout(() => this.poll(), delay);
      }
    }
  }
}
