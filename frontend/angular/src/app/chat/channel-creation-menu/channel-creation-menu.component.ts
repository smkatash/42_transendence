import { Component, EventEmitter, Input, Output } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-channel-creation-menu',
  templateUrl: './channel-creation-menu.component.html',
  styleUrls: ['./channel-creation-menu.component.css'],
  animations: [
    trigger('openClose', [
      state('open', style({
        width: '40%',
        left: '0%'
      })),
      state('closed', style({
        width: '40%',
        left: '-42%'
      })),
      transition('open <=> closed', [
        animate('.7s cubic-bezier(.49,.07,.39,.93)'),
      ]),
    ]),
  ],
})
export class ChannelCreationMenuComponent {

  constructor(private chatService: ChatService){}

  @Input() channelType?: string;
  @Input() isOpen?: boolean;
  @Output() isOpenChange = new EventEmitter<boolean>;

  channelName: string = ''
  channelPassword?: string

  toggle(): void {
    this.isOpen = !this.isOpen;
    this.isOpenChange.emit(this.isOpen);
  }

  createChannel(): void {
    if (!this.channelType) return // Just for typescript

    this.chatService.createChannel({
       name: this.channelName,
       type: this.channelType,
       private: this.channelType === 'private',
       password: this.channelPassword
    })
    this.channelName = ''
    this.channelPassword = ''
    this.toggle()
  }
}
