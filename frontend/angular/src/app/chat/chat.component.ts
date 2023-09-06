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
  Content: typeof Content = Content;
  // contentToDisplay: Content = Content.noContent;
  contentToDisplay: Content = Content.channelCreationSelected; // TODO Delete after styling
  // channelToCreate?: ChannelCreateType;
  channelToCreate: ChannelCreateType = ChannelCreateType.privateChannel; // TODO Delete after styling

  ngOnInit(): void {
    this.getChannels();
  }

  getChannels(): void {
    this.chatService.getChannels()
        .subscribe((channels) => this.channels = channels);
  }

  onChannelSelect(channel: Channel) {
    this.contentToDisplay = Content.channelSelected;
    this.selectedChannel = channel;
  }

  createNewChannel(channel: ChannelCreateType) {
    this.contentToDisplay = Content.channelCreationSelected;
    this.channelToCreate = channel;
  }
}
