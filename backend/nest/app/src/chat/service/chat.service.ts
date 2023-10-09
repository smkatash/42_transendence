import { Injectable, Logger } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { ChannelService } from './channel.service';
import { MessageService } from './message.service';

@Injectable()
export class ChatService {
   constructor(
    private readonly channelService: ChannelService,
    private readonly userServuce: UserService,
    private readonly msgService: MessageService
   ){} 


}
