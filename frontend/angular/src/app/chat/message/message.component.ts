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
      if (!this.msg.inviteId) return
      this.chatService.acceptPrivateInvite(this.msg.inviteId, this.msg.id)
    } else if (this.msg?.inviteType === 'game') {
      // Accept game invite
    }
  }

  declineInvite() {
    if (this.msg?.inviteType === 'channel') {
      if (!this.msg.inviteId) return
      this.chatService.declineChannelInvite(this.msg.inviteId, this.msg.id)
    } else if (this.msg?.inviteType === 'game') {
      // Decline game invite
    }
  }
}
