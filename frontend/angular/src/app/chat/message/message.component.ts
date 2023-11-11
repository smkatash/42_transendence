import { Component, Input } from '@angular/core';
import { Message } from 'src/app/entities.interface';
import { ChatService } from '../chat.service';
import { GameService } from 'src/app/game/game.service';
import { CHANNEL_INVITE, GAME_INVITE } from '../subscriptions-events-constants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent {

  constructor(
    private chatService: ChatService,
    private gameService: GameService,
    private router: Router
  ) {}

  @Input() msg?: Message;
  @Input() sameSender: boolean = false;

  acceptInvite() {
    if (this.msg?.inviteType === CHANNEL_INVITE && this.msg.inviteId) {
      this.chatService.acceptPrivateInvite(String(this.msg.inviteId), this.msg.id)
    } else if (this.msg?.inviteType === GAME_INVITE && this.msg.inviteId) {
      this.gameService.acceptInvite(this.msg.user.id, Number(this.msg.inviteId)) // Naming problem, inviteId is game mode as well
      this.router.navigate(['/game', { invite: false, accept: true }])
    }
  }

  declineInvite() {
    if (this.msg?.inviteType === CHANNEL_INVITE && this.msg.inviteId) {
      this.chatService.declineChannelInvite(String(this.msg.inviteId), this.msg.id)
    } else if (this.msg?.inviteType === GAME_INVITE) {
      // Decline game invite
    }
  }
}
