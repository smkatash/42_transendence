import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { ChatService } from 'src/app/chat/chat.service';
import { DirectMessageComponent } from 'src/app/chat/direct-message/direct-message.component';
import { ADD_ADMIN, BAN, BLOCK, KICK, MUTE, REM_ADMIN, UNBAN, UNBLOCK } from 'src/app/chat/subscriptions-events-constants';
import { Channel, User } from 'src/app/entities.interface';

@Component({
  selector: 'app-channel-user',
  templateUrl: './channel-user.component.html',
  styleUrls: ['./channel-user.component.css']
})
export class ChannelUserComponent {

  public block   = BLOCK
  public unblock = UNBLOCK
  public mute    = MUTE
  public ban     = BAN
  public unban   = UNBAN
  public kick    = KICK
  public promote = ADD_ADMIN
  public demote  = REM_ADMIN

  constructor(
    private chatService: ChatService,
    private el: ElementRef,
    private dm: DirectMessageComponent
  ) {}

  @Input() user?: User;
  @Input() currentUser?: User
  @Input() channel?: Channel
  isDropdownSelected: boolean = false

  toggleDropdown(): void {
    this.isDropdownSelected = !this.isDropdownSelected;
  }

  @HostListener('document:click', ['$event'])
  closeDropdownOnClickOutside(event: Event) {
    if (this.isDropdownSelected && !this.el.nativeElement.contains(event.target)) {
      this.isDropdownSelected = false;
    }
  }

  userIsOwner(): boolean {
    return this.channel?.owner?.id === this.user?.id
  }

  currentIsOwner(): boolean {
    return this.channel?.owner?.id === this.currentUser?.id
  }

  userIsAdmin(): boolean {
    return this.channel?.admins?.some(admin => admin.id === this.user?.id) || false
  }

  currentIsAdmin(): boolean {
    return this.channel?.admins?.some(admin => admin.id === this.currentUser?.id) || false
  }

  manageUserModeration(action: string) {
    if (!this.user || !this.channel) return // Just a check for typescript
    this.chatService.manageUserModeration(action, this.user.id, this.channel?.id)
    this.isDropdownSelected = false
  }
}
