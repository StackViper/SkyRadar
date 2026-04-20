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

  private async poll(): Promise<void> {
    if (!this.isRunning) return;

    logger.debug('Polling OpenSky API for flights...');

    try {
      const rawData = await flightService.fetchLiveFlights();
      const newFlights = flightProcessor.process(rawData);
      
      // Update in-memory store
      flightStore.setLatestFlights(newFlights);
      
      logger.info('Polling success', { 
        selectedFlightsCount: newFlights.length,
        timestamp: new Date().toISOString()
      });

      // Broadcast new updates to clients
      this.socketGateway.broadcastFlights(newFlights);

    } catch (error) {
      logger.error('Polling failed, using last known good state if available', { error: (error as Error).message });
    } finally {
      // Recursive setTimeout to prevent overlapping calls
      if (this.isRunning) {
        this.timeoutId = setTimeout(() => this.poll(), env.POLL_INTERVAL_MS);
      }
    }
  }
}
