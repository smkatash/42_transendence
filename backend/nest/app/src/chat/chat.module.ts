import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './service/chat.service';
import { ChatGateway } from './chat.gateway';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { ChannelService } from './service/channel.service';
import { MessageService } from './service/message.service';
import { Message } from './entities/message.entity';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([
      Channel,
      Message
    ])
  ],
  controllers: [ChatController],
  providers: [
    ChannelService,
    ChatService,
    ChatGateway,
    MessageService
  ]
})
export class ChatModule {}
