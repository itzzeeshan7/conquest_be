import { Module } from '@nestjs/common';
import {RedisServiceAdapter} from './redis-adapter.service';

@Module({
  providers: [RedisServiceAdapter],
  exports: [RedisServiceAdapter]
})
export class RedisAdapterModule {}
