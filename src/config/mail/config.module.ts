import * as Joi from 'joi';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailConfigService } from './config.service';
import { Module } from '@nestjs/common';
import config from './config';
/**
 * Import and provide mail configuration related classes.
 *
 * @module
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      validationSchema: Joi.object({
        MAIL_DOMAIN: Joi.string().allow('').allow(null),
        MAIL_PROTOCOL: Joi.string().allow('').allow(null),
        MAIL_PASSWORD: Joi.string().allow('').allow(null),
        MAIL_USER: Joi.string().allow('').allow(null),
        MAIL_PORT: Joi.number().default(587),
      }),
    }),
  ],
  providers: [ConfigService, MailConfigService],
  exports: [ConfigService, MailConfigService],
})
export class MailConfigModule {}
