import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env explicitly if it exists
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  OPENSKY_URL: z.string().url().default('https://opensky-network.org/api/states/all?lamin=8.0&lomin=68.0&lamax=37.0&lomax=97.0'),
  POLL_INTERVAL_MS: z.string().transform(Number).default('10000'),
  CORS_ORIGIN: z.string().default('*'),
  // OpenSky Basic Auth credentials (optional, for higher rate limits)
  OPENSKY_USERNAME: z.string().optional(),
  OPENSKY_PASSWORD: z.string().optional(),
});

export const env = envSchema.parse(process.env);
