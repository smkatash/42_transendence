import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChatService } from '../chat.service';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-direct-message',
  templateUrl: './direct-message.component.html',
  styleUrls: ['./direct-message.component.css'],
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
export class DirectMessageComponent {
  constructor(private chatservice: ChatService,
    ){}

  @Input() isOpen?: boolean;
  @Output() isOpenChange = new EventEmitter<boolean>
  messageToSend?: string;
  
  toggle(): void {
    this.isOpen = !this.isOpen;
    this.isOpenChange.emit(this.isOpen)
  }
  sendMessage(): void {
    if (this.messageToSend === undefined) return
    this.messageToSend = this.messageToSend.trim();

    if (!this.messageToSend) return;
    this.chatservice.sendDM('userid',this.messageToSend);
    this.messageToSend = ''
    this.toggle()
  }

}
