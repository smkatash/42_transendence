import { Component, Input } from '@angular/core';
import { Message } from 'src/app/entities.interface';
import { ChatService } from '../chat.service';
import { GameService } from 'src/app/game/game.service';
import { CHANNEL_INVITE, GAME_INVITE } from '../subscriptions-events-constants';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent {

  constructor(
    private chatService: ChatService,
    private gameService: GameService) {}

  @Input() msg?: Message;
  @Input() sameSender: boolean = false;

  acceptInvite() {
    if (this.msg?.inviteType === CHANNEL_INVITE) {
      if (!this.msg.inviteId) return
      this.chatService.acceptPrivateInvite(this.msg.inviteId, this.msg.id)
    } else if (this.msg?.inviteType === GAME_INVITE) {
      this.gameService.acceptInvite(this.msg.user.id, this.msg.inviteId) // Naming problem, inviteId is game mode as well
    }
  }

  declineInvite() {
    if (this.msg?.inviteType === CHANNEL_INVITE) {
      if (!this.msg.inviteId) return
      this.chatService.declineChannelInvite(this.msg.inviteId, this.msg.id)
    } else if (this.msg?.inviteType === GAME_INVITE) {
      // Decline game invite
    }
  }
}
