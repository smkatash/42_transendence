import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Message } from '../message/message';

@Component({
  selector: 'app-channel-messages-content',
  templateUrl: './channel-messages-content.component.html',
  styleUrls: ['./channel-messages-content.component.css']
})
export class ChannelMessagesContentComponent {
  @ViewChild('messageContainer') messageContainer!: ElementRef;
  @Input() messages?: Message[];

  message?: string;

  scrollToBottom() {
    this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
  }

  // TODO: Get username and generate timestamp
  sendMessage(): void{
    if (this.message !== undefined && this.messages !== undefined) {
      this.message = this.message.trim();
      if (!this.message)
        return;
      console.log(this.message);
      this.messages.push({
        name: 'username',
        messageContent: `${this.message}`,
        timestamp: 0,
        sessionUser: true
      });
      this.scrollToBottom();
      this.message = '';
    }
  }

}
