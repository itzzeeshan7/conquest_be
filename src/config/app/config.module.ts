import * as Joi from "joi";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {AppConfigService} from "./config.service";
import {Module} from "@nestjs/common";
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
                APP_ENV: Joi.string()
                    .valid('development', 'production')
                    .default('development'),
                APP_URL: Joi.string().default('//localhost:3001'),
                APP_DOMAIN: Joi.string(),
                APP_PORT: Joi.number().default(9000),
                APP_JWT_SECRET: Joi.string(),
                APP_JWT_EXPIRES_IN: Joi.string().default('60s'),
                PERCHWELL_USERNAME: Joi.string(),
                PERCHWELL_PASSWORD: Joi.string(),
                TRESTLE_CLIENT_ID: Joi.string(),
                TRESTLE_CLIENT_SECRETE: Joi.string(),
                MAP_QUEST_SERVICE_KEY: Joi.string(),
                CRON_JOBS_ACTIVE: Joi.string().default('0'),
            }),
        }),
    ],
    providers: [ConfigService, AppConfigService],
    exports: [ConfigService, AppConfigService],
})
export class AppConfigModule {}
