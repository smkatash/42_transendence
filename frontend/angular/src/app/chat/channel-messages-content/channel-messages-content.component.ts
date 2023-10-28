import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ChatService } from '../chat.service';
import { Channel, Message } from 'src/app/entities.interface';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-channel-messages-content',
  templateUrl: './channel-messages-content.component.html',
  styleUrls: ['./channel-messages-content.component.css']
})
export class ChannelMessagesContentComponent implements OnChanges {

  constructor(private chatService: ChatService){}

  @ViewChild('messageContainer') messageContainer!: ElementRef;

  // @Input() channelId?: number;
  @Input() channel?: Channel; //also observable for notifications?
  // messages: Message[] = [];
  messages$: Observable<Message[]> = this.chatService.getChannelMessages();
  message?: string;
  loading: boolean = false;
  isSettingsOpen: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['channel'] && this.channel) {
        // if (this.channel) {
          this.chatService.askForChannelMessages(this.channel)
        // } else  {
          this.loading = true;
        // }
      // this.getMessages(this.channelId);
    }
  }

  getMessages(id: number): void {
    // this.chatService.getChannelMessages(id)
    //   .subscribe((messages) => {
    //     this.messages = messages,
    //     this.loading = false;
    //   });
  }

  scrollToBottom() {
    this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
  }

  // TODO: Get username and generate timestamp
  sendMessage(): void{
    if (this.message !== undefined && this.channel?.id /*&& this.messages !== undefined*/) {
      this.message = this.message.trim();
      if (!this.message)
        return;
      console.log(this.message);
      const newMessage: Message = {
        content: this.message,
        channelId: this.channel.id
      }
      this.chatService.sendMessage(newMessage);
      // this.messages.push({
      //   name: 'username',
      //   messageContent: `${this.message}`,
      //   timestamp: 0,
      //   sessionUser: true
      // });
      this.scrollToBottom();
      this.message = '';
    }
  }

  openSettings(): void {
    this.isSettingsOpen = true;
  }

}
