import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/app/config.module';
import { DatabaseConfigModule } from './config/database/postgres/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataBaseConfigService } from './config/database/postgres/config.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { MailConfigModule } from './config/mail/config.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailConfigService } from './config/mail/config.service';
import { RedisModule } from '@nestjs-modules/ioredis';
import { RedisConfigModule } from './config/database/redis/config.module';
import { RedisConfigService } from './config/database/redis/config.service';
import { MailModule } from './shared/mail/mail.module';
import { SearchModule } from './modules/search/search.module';
import { ListingsModule } from './modules/listings/listings.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AppService } from './app.service';
import { OtherApisModule } from './modules/other-apis/other-apis.module';
import { CronModule } from './libs/cron/cron.module';
import { HealthModule } from './health/health.module';

const configs = [
  AppConfigModule,
  DatabaseConfigModule,
  MailConfigModule,
  RedisConfigModule,
];

const modules = [
  UsersModule,
  AuthModule,
  RedisModule,
  MailModule,
  SearchModule,
  ListingsModule,
  OtherApisModule,
  CronModule,
  HealthModule,
  ScheduleModule.forRoot(),
];

const db = [
  TypeOrmModule.forRootAsync({
    imports: [DatabaseConfigModule],
    useFactory: (dataBaseConfigService: DataBaseConfigService) => ({
      type: 'postgres',
      host: dataBaseConfigService.host,
      port: dataBaseConfigService.port,
      username: dataBaseConfigService.user,
      password: dataBaseConfigService.password,
      database: dataBaseConfigService.name,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    inject: [DataBaseConfigService],
  }),
];

const mail = [
  MailerModule.forRootAsync({
    imports: [MailConfigModule],
    useFactory: (mailConfigService: MailConfigService) => ({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: mailConfigService.user,
          pass: mailConfigService.password,
        },
      },
    }),
    inject: [MailConfigService],
  }),
];

const redis = [
  RedisModule.forRootAsync({
    imports: [RedisConfigModule],
    useFactory: async (redisConfigService: RedisConfigService) => ({
      type: 'single',
      options: {
        host: redisConfigService.host || 'localhost',
        port: redisConfigService.port || 6379,
        db: redisConfigService.db || 0,
        password: redisConfigService.password || undefined,
      },
    }),
    inject: [RedisConfigService],
  }),
];

@Module({
  imports: [...configs, ...db, ...modules, ...mail, ...redis],
  controllers: [],
  providers: [AppService],
})
export class AppModule { }
