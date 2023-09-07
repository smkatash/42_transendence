import { Component } from '@angular/core';

import { Channel } from './sidebar-channel/channel';

import { ChatService } from './chat.service';
import { Message } from './message/message';

import { ChannelCreateType, Content } from './chat.enum';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent {

  constructor(private chatService: ChatService){ }

  messages: Message[] = [];
  channels: Channel[] = [];
  selectedChannel?: Channel;
  channelToCreate?: ChannelCreateType;
  // channelToCreate: ChannelCreateType = ChannelCreateType.privateChannel; // TODO Delete after styling

  ngOnInit(): void {
    this.getChannels();
  }

  getChannels(): void {
    this.chatService.getChannels()
        .subscribe((channels: Channel[]) => this.channels = channels);
  }

  onChannelSelect(channel: Channel) {
    this.selectedChannel = channel;
  }

  createNewChannel(channelType: ChannelCreateType) {
    this.channelToCreate = channelType;
  }
}
