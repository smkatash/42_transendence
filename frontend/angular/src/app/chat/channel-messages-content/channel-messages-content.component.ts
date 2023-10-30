import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ChatService } from '../chat.service';
import { Message } from 'src/app/entities.interface';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-channel-messages-content',
  templateUrl: './channel-messages-content.component.html',
  styleUrls: ['./channel-messages-content.component.css']
})
export class ChannelMessagesContentComponent {

  constructor(private chatService: ChatService){}

  @ViewChild('messageContainer') messageContainer!: ElementRef;

  @Input() channelID?: number;
  messages$: Observable<Message[]> = this.chatService.getChannelMessages();
  message?: string;
  loading: boolean = false;
  isSettingsOpen: boolean = false;

  sendMessage(): void {

    if (this.message === undefined || this.channelID === undefined) return

    this.message = this.message.trim();

    if (!this.message) return;

    this.chatService.sendMessage(this.channelID, this.message)

    this.scrollToBottom();
    this.message = '';
  }

    scrollToBottom() {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    }

    openSettings(): void {
      this.isSettingsOpen = true;
    }
  }
