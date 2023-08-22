import { Component } from '@angular/core';

import { MESSAGES } from './message/mock-messages';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  messages = MESSAGES;
}
