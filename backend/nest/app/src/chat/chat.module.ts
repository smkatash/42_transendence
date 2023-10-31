import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { ChannelService } from './service/channel.service';
import { MessageService } from './service/message.service';
import { Message } from './entities/message.entity';
import { ChatUser } from './entities/chatUser.entity';
import { ChatUserService } from './service/chat-user.service';
import { JoinedChannel } from './entities/joinedChannel.entity';
import { JoinedChannelService } from './service/joined-channel.service';
import { User } from 'src/user/entities/user.entity';
import { Mute } from './entities/mute.entity';
import { MuteService } from './service/mute.service';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([
      Channel,
      ChatUser,
      Message,
      JoinedChannel,
      Mute
    ])
  ],
  providers: [
    ChannelService,
    ChatGateway,
    MessageService,
    ChatUserService,
    JoinedChannelService,
    MuteService
  ]
})
export class ChatModule {}
