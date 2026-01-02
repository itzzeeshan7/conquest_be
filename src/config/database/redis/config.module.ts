import * as Joi from "joi";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {RedisConfigService} from "./config.service";
import {Module} from "@nestjs/common";
import config from './config';
/**
 * Import and provide redis-adapter configuration related classes.
 *
 * @module
 */
@Module({
    imports: [
        ConfigModule.forRoot({
            load: [config],
            validationSchema: Joi.object({
                REDIS_PASSWORD: Joi.string().allow('').allow(null),
                REDIS_DB: Joi.number().allow('').allow(null),
                REDIS_HOST: Joi.string().allow('').allow(null),
                REDIS_PORT: Joi.number().allow('').allow(null),
            }),
        }),
    ],
    providers: [ConfigService, RedisConfigService],
    exports: [ConfigService, RedisConfigService],
})
export class RedisConfigModule {}
