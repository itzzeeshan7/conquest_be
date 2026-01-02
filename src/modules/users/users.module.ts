import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './repositories/users.repository';
import { UserRolesService } from './services/userRoles.service';
import { UserRoleRepository } from './repositories/userRole.repository';
import { RedisAdapterModule } from '../../shared/redis-adapter/redis-adapter.module';
import { MailModule } from '../../shared/mail/mail.module';
import { UserStorageRepository } from './repositories/userStorage.repository';
import { UserStorageService } from './services/userStorage.service';
import { ListingsModule } from '../listings/listings.module';
import { ScheduledViewingRepository } from './repositories/scheduledViewing.repository';
import { ScheduledViewingService } from './services/scheduledViewing.service';
import { ListingsRepository } from '../listings/repositories/Listings.repository';
import { PropertyRepository } from '../listings/repositories/Properties.repository';
import { OpenHouseRepository } from '../listings/repositories/OpenHouse.repository';

@Module({
  imports: [
    RedisAdapterModule,
    MailModule,
    ListingsModule,
    TypeOrmModule.forFeature([]),
  ],
  providers: [
    UsersService,
    UserRolesService,
    UserStorageService,
    ScheduledViewingService,
    UserRepository,
    UserRoleRepository,
    UserStorageRepository,
    ScheduledViewingRepository,
    ListingsRepository,
    PropertyRepository,
    OpenHouseRepository
  ],
  controllers: [UsersController],
  exports: [UsersService, UserRolesService, UserStorageService],
})
export class UsersModule { }
