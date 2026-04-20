import { createServer } from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { SocketGateway } from './sockets/socket.gateway';
import { FlightScheduler } from './modules/flights/flight.scheduler';

const startServer = () => {
  const app = createApp();
  const server = createServer(app);

  // Initialize Socket.IO Gateway
  const socketGateway = new SocketGateway(server);

  // Initialize and start Polling Worker
  const flightScheduler = new FlightScheduler(socketGateway);
  flightScheduler.start();

  server.listen(env.PORT, () => {
    logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });

  // Graceful Shutdown Handling
  const shutdown = (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    
    // Stop polling
    flightScheduler.stop();

    // Close server
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });

    // Force close after timeout if connections hang
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer();
