import { Module } from '@nestjs/common';
import { ChannelUserService } from './channel_user.service';
import { ChannelUserController } from './channel_user.controller';

@Module({
  controllers: [ChannelUserController],
  providers: [ChannelUserService]
})
export class ChannelUserModule {}
