// Sentry must be imported before any other modules
import './instrument';

import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppConfigService } from './config/app/config.service';
import SwaggerSetup from './swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SentryExceptionFilter } from './filters/sentry-exception.filter';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import { RolesGuard } from './modules/auth/roles.guard';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Security middleware
  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    }),
  );
  app.use(compression());
  app.use(morgan('combined'));
  app.enableCors();

  // Getting config
  const appConfig: AppConfigService = app.get(AppConfigService);

  // Global pipes and filters
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new SentryExceptionFilter());

  if (appConfig.env === 'development') {
    SwaggerSetup(app);
  }

  await app.listen(appConfig.port);
  logger.log(`Application running on port: ${appConfig.port}`);
  logger.log(`Environment: ${appConfig.env}`);
}

bootstrap();
