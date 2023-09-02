import { Component } from '@angular/core';

import { MESSAGES } from './message/mock-messages';
import { Channel } from './sidebar-channel/channel';

import { ChatService } from './chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {

  constructor(private chatService: ChatService){ }

  messages = MESSAGES;
  channels: Channel[] = [];
  // channels = this.chatService.getChannels();
  selectedChannel?: Channel;
  // selectedChannel?: Channel = CHANNELS[0];

  ngOnInit(): void {
    this.getChannels();
  }

  getChannels(): void {
    this.chatService.getChannels()
        .subscribe((channels) => this.channels = channels);
  }

  onSelect(channel: Channel) {
    this.selectedChannel = channel;
  }
}
