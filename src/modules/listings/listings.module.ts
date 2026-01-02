import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ListingsService } from './services/listings.service';
import { ListingsController } from './listings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListingsRepository } from './repositories/Listings.repository';
import { PerchwellModule } from '../../libs/perchwell/perchwell.module';
import { OtherApisModule } from '../other-apis/other-apis.module';
import { RedisAdapterModule } from '../../shared/redis-adapter/redis-adapter.module';
import { PropertyRepository } from './repositories/Properties.repository';
import { PropertiesService } from './services/properties.service';
import { TrestleModule } from '../../libs/tretsle/trestle.module';
import { OpenHouseRepository } from './repositories/OpenHouse.repository';
import { MapsLocationModule } from '../../libs/maps-location/maps-location.module';
import { AutosuggestionRepository } from './repositories/Autosuggestion.repository';
import { UtilityService } from '../../providers/utility.service';
import { LocationRepository } from './repositories/Location.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([]),
    PerchwellModule,
    OtherApisModule,
    RedisAdapterModule,
    TrestleModule,
    MapsLocationModule
  ],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useFactory: ref => new JwtAuthGuard(ref),
    //   inject: [Reflector],
    // },
    ListingsService,
    PropertiesService,
    UtilityService,
    ListingsRepository,
    PropertyRepository,
    OpenHouseRepository,
    AutosuggestionRepository,
    LocationRepository,
  ],
  controllers: [ListingsController],
  exports: [ListingsService,PropertiesService],
})
export class ListingsModule { }
