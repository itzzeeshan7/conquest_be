import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../../config/app/config.module';
import { ListingsRepository } from '../../modules/listings/repositories/Listings.repository';
import { LocationRepository } from '../../modules/listings/repositories/Location.repository';
import { UserStorageRepository } from '../../modules/users/repositories/userStorage.repository';
import { UserStorageService } from '../../modules/users/services/userStorage.service';
import { UtilityService } from '../../providers/utility.service';
import { MailModule } from '../../shared/mail/mail.module';
import { PerchwellModule } from '../perchwell/perchwell.module';
import { CronService } from './cron.service';
import { TrestleModule } from '../tretsle/trestle.module';
import { PropertyRepository } from '../../modules/listings/repositories/Properties.repository';
import { OpenHouseRepository } from '../../modules/listings/repositories/OpenHouse.repository';
import { AutosuggestionRepository } from '../../modules/listings/repositories/Autosuggestion.repository';
import { MapsLocationService } from '../maps-location/maps-location.service';

@Module({
    imports: [HttpModule,
        AppConfigModule,
        PerchwellModule,
        TrestleModule,
        MailModule,
        TypeOrmModule.forFeature([])],
    providers: [
        CronService,
        UtilityService,
        UserStorageService,
        MapsLocationService,
        UserStorageRepository,
        ListingsRepository,
        PropertyRepository,
        OpenHouseRepository,
        AutosuggestionRepository,
        LocationRepository
    ],
    exports: [CronService],
})
export class CronModule { }
