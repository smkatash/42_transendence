import { Component, EventEmitter, Input, Output } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-channel-creation-menu',
  templateUrl: './channel-request-password.component.html',
  styleUrls: ['./channel-request-password.component.css'],
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
export class ChannelRequestPasswordMenuComponent {//need renaming and adding it to the main module

  constructor(private chatService: ChatService){}//not sure if needed

  @Input() channelType?: string;
  @Input() isOpen?: boolean;
  @Output() isOpenChange = new EventEmitter<boolean>;

  channelPassword: string

  toggle(): void {
    this.isOpen = !this.isOpen;
    this.isOpenChange.emit(this.isOpen);
  }

  //maybe calling join channel here or return the password back and then calling it
}
