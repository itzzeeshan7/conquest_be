import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../../config/app/config.module';
import { UtilityService } from '../../providers/utility.service';
import { OtherApisController } from './other-apis.controller';
import { OpenDataRepository } from './repositories/openData.repository';
import { MailModule } from './../../shared/mail/mail.module'

import { OpenDataApisService } from './services/open-data-apis.service';
import { UserRoleRepository } from '../users/repositories/userRole.repository';
import { UserRepository } from '../users/repositories/users.repository';

@Module({
  imports: [
    HttpModule,
    AppConfigModule,
    TypeOrmModule.forFeature([]),
    MailModule
  ],
  providers: [
    OpenDataApisService,
    UtilityService,
    OpenDataRepository,
    UserRepository,
    UserRoleRepository,
  ],
  controllers: [OtherApisController],
  exports: [OpenDataApisService],
})
export class OtherApisModule { }
