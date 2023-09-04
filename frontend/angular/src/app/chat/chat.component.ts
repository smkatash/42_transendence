import { Component } from '@angular/core';

import { Channel } from './sidebar-channel/channel';

import { ChatService } from './chat.service';
import { Message } from './message/message';

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
  // selectedChannel?: Channel = CHANNELS[0];

  ngOnInit(): void {
    this.getChannels();
  }

  getChannels(): void {
    this.chatService.getChannels()
        .subscribe((channels) => this.channels = channels);
  }

  getChannelMessages(channelId: number): void {
    this.chatService.getChannelMessages(channelId)
    .subscribe((channelMessages) => {this.messages = channelMessages.messages});
  }

  onChannelSelect(channel: Channel) {
    this.selectedChannel = channel;
    this.getChannelMessages(channel.id);
  }
}
