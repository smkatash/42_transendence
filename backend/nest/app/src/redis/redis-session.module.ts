import { Module } from '@nestjs/common';
import { RedisSessionService } from './redis-session.service';


@Module({
  providers: [RedisSessionService],
  exports: [RedisSessionService]
})
export class RedisSessionModule {}