import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ChatService } from '../chat.service';
import { Channel, Message, User } from 'src/app/entities.interface';
import { ProfileService } from 'src/app/profile/profile.service';

@Component({
  selector: 'app-channel-messages-content',
  templateUrl: './channel-messages-content.component.html',
  styleUrls: ['./channel-messages-content.component.css']
})
export class ChannelMessagesContentComponent implements OnInit {

  constructor(private chatService: ChatService){}


  @ViewChild('messageContainer') messageContainer!: ElementRef;

  @Input() channel?: Channel
  @Output() channelChange = new EventEmitter<Channel | undefined>
  fetchedMessages: Message[] = []
  incomingMessages: Message[] = []
  messageToSend?: string;
  loading: boolean = false;
  isSettingsOpen: boolean = false;


  ngOnInit(): void {
    this.chatService.getChannelMessages()
      .subscribe(messages => this.fetchedMessages = messages)

    this.chatService.getIncomingMessages()
      .subscribe(message => {
        if (message.channel.id === this.channel?.id){
          this.incomingMessages.push(message)
        }
      })
  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   if (changes['channelID']) {

  //   }
  // }

  sendMessage(): void {

    if (this.messageToSend === undefined || this.channel === undefined) return

    this.messageToSend = this.messageToSend.trim();

    if (!this.messageToSend) return;

    this.chatService.sendMessage(this.channel?.id, this.messageToSend)

    this.scrollToBottom()
    this.messageToSend = ''
  }

  scrollToBottom() {
    this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
  }

  openSettings(): void {
    this.isSettingsOpen = true;
  }

  channelChangeEvent(channel: Channel | undefined) {
    console.log(channel)
	this.incomingMessages = []
    this.channelChange.emit(channel)
  }
}
