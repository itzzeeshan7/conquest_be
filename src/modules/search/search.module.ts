import { Module} from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import {PerchwellModule} from "../../libs/perchwell/perchwell.module";
import { TrestleModule } from '../../libs/tretsle/trestle.module';

@Module({
  imports: [
      PerchwellModule,
      TrestleModule
  ],
  controllers: [SearchController],
  providers: [
    SearchService,
  ]
})
export class SearchModule {}
