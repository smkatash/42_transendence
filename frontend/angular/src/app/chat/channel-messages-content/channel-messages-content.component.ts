import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ChatService } from '../chat.service';
import { Message } from 'src/app/entities.interface';

@Component({
  selector: 'app-channel-messages-content',
  templateUrl: './channel-messages-content.component.html',
  styleUrls: ['./channel-messages-content.component.css']
})
export class ChannelMessagesContentComponent implements OnChanges {

  constructor(private chatService: ChatService){}

  @ViewChild('messageContainer') messageContainer!: ElementRef;

  @Input() channelId?: number;
  messages: Message[] = [];
  message?: string;
  loading: boolean = false;
  isSettingsOpen: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['channelId'] && this.channelId) {
      this.loading = true;
      this.getMessages(this.channelId);
    }
  }

  getMessages(id: number): void {
    this.chatService.getChannelMessages(id)
      .subscribe((messages) => {
        this.messages = messages,
        this.loading = false;
      });
  }

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

  openSettings(): void {
    this.isSettingsOpen = true;
  }

}
