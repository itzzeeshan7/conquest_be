import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MapsLocationService } from './maps-location.service';
import { AppConfigModule } from '../../config/app/config.module';

@Module({
  imports: [HttpModule, AppConfigModule],
  providers: [MapsLocationService],
  exports: [MapsLocationService],
})
export class MapsLocationModule {}
