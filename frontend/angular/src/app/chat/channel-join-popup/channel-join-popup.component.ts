import { Component, EventEmitter, Input, Output } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChatService } from '../chat.service';
import { Channel } from 'src/app/entities.interface';

@Component({
  selector: 'app-channel-join-popup',
  templateUrl: './channel-join-popup.component.html',
  styleUrls: ['./channel-join-popup.component.css'],
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
export class ChannelJoinPopupComponent {
  constructor(private chatService: ChatService) {}

  @Input() isOpen?: boolean;
  @Output() isOpenChange = new EventEmitter<boolean>;

  @Input() channel?: Channel
  channelPassword?: string

  toggle(): void {
    this.isOpen = !this.isOpen;
    this.isOpenChange.emit(this.isOpen);
  }

  tryPassword(): void {
    if (!this.channel) return // Just for typescript

    this.chatService.joinChannel({
      id: this.channel.id,
      password: this.channelPassword
    })
    this.chatService.requestUserChannels()
    this.toggle()
  }
}
