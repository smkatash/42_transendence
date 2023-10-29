import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChannelCreateType } from '../chat.enum';
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

  ChannelCreateType: typeof ChannelCreateType = ChannelCreateType;
  @Input() channelType?: ChannelCreateType;
  @Input() isOpen?: boolean;
  @Output() isOpenChange = new EventEmitter<boolean>;

  channelName: string = ''
  channelPassword?: string

  toggle(): void {
    this.isOpen = !this.isOpen;
    this.isOpenChange.emit(this.isOpen);
  }

  createChannel(): void {
    this.chatService.createChannel({
       name: this.channelName,
       private: this.channelType === ChannelCreateType.privateChannel,
       password: this.channelPassword
    })
  }
}
