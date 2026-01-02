import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PerchwellService } from './perchwell.service';
import { AppConfigModule } from '../../config/app/config.module';
import { UtilityService } from '../../providers/utility.service';

@Module({
  imports: [HttpModule, AppConfigModule],
  providers: [PerchwellService, UtilityService],
  exports: [PerchwellService],
})
export class PerchwellModule { }
