import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ChatService } from '../chat.service';
import { Channel, Message } from 'src/app/entities.interface';
import { AudioService } from 'src/app/audio.service';

@Component({
  selector: 'app-channel-messages-content',
  templateUrl: './channel-messages-content.component.html',
  styleUrls: ['./channel-messages-content.component.css']
})
export class ChannelMessagesContentComponent implements OnInit {

  constructor(private chatService: ChatService,
              private audioService: AudioService){}


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
          this.scrollToBottom()
        }
      })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['channel']) {
      let prevVal = changes['channel'].previousValue
      if (prevVal && prevVal.id !== this.channel?.id) {
        this.incomingMessages = []
      }
    }
  }

  sendMessage(): void {
    if (this.messageToSend === undefined || this.channel === undefined) return
    this.messageToSend = this.messageToSend.trim();
    if (!this.messageToSend) return;
    this.chatService.sendMessage(this.channel?.id, this.messageToSend)
    this.messageToSend = ''
    this.audioService.playMessage()
  }

  scrollToBottom() {
    this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
  }

  openSettings(): void {
    this.isSettingsOpen = true;
  }

  channelChangeEvent(channel: Channel | undefined) {
    this.channelChange.emit(channel)
  }
}
