import { Component } from '@angular/core';

import { Channel } from './sidebar-channel/channel';

import { ChatService } from './chat.service';

import { ChannelCreateType } from './chat.enum';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent {

  constructor(private chatService: ChatService){ }

  channels: Channel[] = [];
  selectedChannel?: Channel;
  channelToCreate?: ChannelCreateType;
  isChannelToCreateActive: boolean = false;

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
    this.isChannelToCreateActive = true;
  }
}
