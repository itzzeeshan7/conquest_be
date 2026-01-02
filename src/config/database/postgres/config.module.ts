import * as Joi from 'joi';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataBaseConfigService } from './config.service';
import { Module } from '@nestjs/common';
import config from './config';
/**
 * Import and provide app configuration related classes.
 *
 * @module
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      validationSchema: Joi.object({
        DB_NAME: Joi.string().default('conquest'),
        DB_PORT: Joi.number().default(5432),
        DB_HOST: Joi.string().default('127.0.0.1'),
        DB_USER: Joi.string().default('postgres'),
        DB_PASSWORD: Joi.string().allow('').allow(null),
      }),
    }),
  ],
  providers: [ConfigService, DataBaseConfigService],
  exports: [ConfigService, DataBaseConfigService],
})
export class DatabaseConfigModule {}
