import { Router, Request, Response } from 'express';
import { flightStore } from '../modules/flights/flight.store';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    lastPollAt: flightStore.getLastUpdatedAt()?.toISOString() || null,
  });
});

export const healthRoute = router;
