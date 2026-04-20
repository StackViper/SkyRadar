import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { logger } from '../config/logger';
import { CONSTANTS } from '../shared/constants';
import { flightStore } from '../modules/flights/flight.store';
import { FlightData } from '../modules/flights/flight.types';
import { env } from '../config/env';

export class SocketGateway {
  private io: Server;

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: env.CORS_ORIGIN,
        methods: ['GET', 'POST'],
      },
      // Heartbeat safe defaults
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.setupListeners();
  }

  private setupListeners(): void {
    this.io.on(CONSTANTS.WEBSOCKET_EVENTS.CONNECT, (socket: Socket) => {
      logger.info('Socket connected', { id: socket.id });

      // Send last known state immediately on connection
      const latestFlights = flightStore.getLatestFlights();
      if (latestFlights.length > 0) {
        socket.emit(CONSTANTS.WEBSOCKET_EVENTS.FLIGHTS_UPDATE, {
          data: latestFlights,
          isStale: flightStore.isStale(),
          timestamp: flightStore.getLastUpdatedAt(),
        });
      }

      socket.on(CONSTANTS.WEBSOCKET_EVENTS.DISCONNECT, (reason) => {
        logger.info('Socket disconnected', { id: socket.id, reason });
      });
    });
  }

  public broadcastFlights(flights: FlightData[]): void {
    this.io.emit(CONSTANTS.WEBSOCKET_EVENTS.FLIGHTS_UPDATE, {
      data: flights,
      isStale: false,
      timestamp: new Date(),
    });
  }
}
