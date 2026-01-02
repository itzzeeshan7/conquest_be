import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TrestleService } from './trestle.service';
import { AppConfigModule } from '../../config/app/config.module';
import { UtilityService } from '../../providers/utility.service';

@Module({
  imports: [HttpModule, AppConfigModule],
  providers: [TrestleService, UtilityService],
  exports: [TrestleService],
})
export class TrestleModule {}
