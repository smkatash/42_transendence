import { Component } from '@angular/core';

import { MESSAGES } from './message/mock-messages';
import { CHANNELS } from './sidebar-channel/mock-channels';
import { Channel } from './sidebar-channel/channel';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  messages = MESSAGES;
  channels = CHANNELS;
  selectedChannel?: Channel;

  onSelect(channel: Channel) {
    this.selectedChannel = channel;
  }
}
