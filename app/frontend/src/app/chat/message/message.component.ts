import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  @Output() clearIncomingArray = new EventEmitter

  acceptInvite() {
    if (this.msg?.inviteType === CHANNEL_INVITE && this.msg.inviteId) {
      this.chatService.acceptPrivateInvite(String(this.msg.inviteId), this.msg.id)
    } else if (this.msg?.inviteType === GAME_INVITE && this.msg.inviteId) {
      this.chatService.invalidateMessage(this.msg.id)
      this.router.navigate(['/game'], {
        queryParams: {
          invite: false,
          accept: true,
          userId: this.msg.user.id,
          level: this.msg.inviteId
        }
      });
    }
    this.msg = undefined
  }

  declineInvite() {
    if (this.msg?.inviteType === CHANNEL_INVITE && this.msg.inviteId) {
      this.chatService.declineChannelInvite(String(this.msg.inviteId), this.msg.id)
    } else if (this.msg?.inviteType === GAME_INVITE) {
      this.chatService.invalidateMessage(this.msg.id)
      this.gameService.declineInvite(this.msg.user.id, Number(this.msg.inviteId)) // Naming problem, inviteId is game mode as well
    }
    this.msg = undefined
  }
}
