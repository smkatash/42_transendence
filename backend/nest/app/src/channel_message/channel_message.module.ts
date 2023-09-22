import { Module } from '@nestjs/common';
import { ChannelMessageService } from './channel_message.service';
import { ChannelMessageController } from './channel_message.controller';

@Module({
  controllers: [ChannelMessageController],
  providers: [ChannelMessageService]
})
export class ChannelMessageModule {}
