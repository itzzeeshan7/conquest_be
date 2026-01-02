import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { config } from 'dotenv';

// Load .env file before accessing environment variables
config();

const SENTRY_DSN = process.env.SENTRY_DSN;
const APP_ENV = process.env.APP_ENV || 'development';

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: APP_ENV,
    integrations: [
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: APP_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: APP_ENV === 'production' ? 0.1 : 1.0,
    debug: false,
  });
}
