import { Module } from '@nestjs/common';
import { ChannelMessageService } from './channel-message.service';
import { ChannelMessageController } from './channel-message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelMessage } from './entities/channel-message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChannelMessage])],
  controllers: [ChannelMessageController],
  providers: [ChannelMessageService],
})
export class ChannelMessageModule {}
