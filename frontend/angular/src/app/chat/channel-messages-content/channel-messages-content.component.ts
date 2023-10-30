import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ChatService } from '../chat.service';
import { Message } from 'src/app/entities.interface';

@Component({
  selector: 'app-channel-messages-content',
  templateUrl: './channel-messages-content.component.html',
  styleUrls: ['./channel-messages-content.component.css']
})
export class ChannelMessagesContentComponent implements OnInit {

  constructor(private chatService: ChatService){}


  @ViewChild('messageContainer') messageContainer!: ElementRef;

  @Input() channelID?: number;
  fetchedMessages: Message[] = []
  incomingMessages: Message[] = []
  messageToSend?: string;
  loading: boolean = false;
  isSettingsOpen: boolean = false;

  ngOnInit(): void {
    this.chatService.getChannelMessages()
      .subscribe(messages => this.fetchedMessages = messages)

    this.chatService.getIncomingMessages()
      .subscribe(message => this.incomingMessages.push(message))
  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   if (changes['channelID']) {

  //   }
  // }

  sendMessage(): void {

    if (this.messageToSend === undefined || this.channelID === undefined) return

    this.messageToSend = this.messageToSend.trim();

    if (!this.messageToSend) return;

    this.chatService.sendMessage(this.channelID, this.messageToSend)

    this.scrollToBottom();
    this.messageToSend = '';
  }

  scrollToBottom() {
    this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
  }

  openSettings(): void {
    this.isSettingsOpen = true;
  }
}
