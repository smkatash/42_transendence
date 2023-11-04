import { Component, Input } from '@angular/core';
import { Message } from 'src/app/entities.interface';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent {

  constructor(private chatService: ChatService) {}

  @Input() msg?: Message;
  @Input() sameSender: boolean = false;

  acceptInvite() {
    if (this.msg?.inviteType === 'channel') {
      if (typeof this.msg.inviteId !== 'number') return
      this.chatService.joinChannel({ id: this.msg.inviteId })
    } else if (this.msg?.inviteType === 'game') {
      // Accept game invite
    }
  }

  declineInvite() {
    if (this.msg?.inviteType === 'channel') {
      if (typeof this.msg.inviteId !== 'number') return
      this.chatService.declineChannelInvite(this.msg.id)
    } else if (this.msg?.inviteType === 'game') {
      // Decline game invite
    }
  }
}
