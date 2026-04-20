import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { healthRoute } from './health/health.route';
import { flightStore } from './modules/flights/flight.store';

export const createApp = (): Application => {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());

  // Routes
  app.use(healthRoute);

  app.get('/flights', (_req: Request, res: Response) => {
    const flights = flightStore.getLatestFlights();
    res.json({
      data: flights,
      isStale: flightStore.isStale(),
      timestamp: flightStore.getLastUpdatedAt(),
    });
  });

  // 404 Handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not Found' });
  });

  // Global Error Handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      error: err.message || 'Internal Server Error',
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  });

  return app;
};
