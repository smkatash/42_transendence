import { Component, ElementRef, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { HOST_IP } from 'src/app/Constants';
import { ChatService } from 'src/app/chat/chat.service';
import { ADD_ADMIN, BAN, BLOCK, GAME_INVITE, KICK, MUTE, REM_ADMIN, UNBAN, UNBLOCK } from 'src/app/chat/subscriptions-events-constants';
import { Channel, User } from 'src/app/entities.interface';
import { GameService } from 'src/app/game/game.service';
import { ProfileService } from 'src/app/profile/profile.service';

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

  public domain  = HOST_IP

  constructor(
    private chatService: ChatService,
    private gameService: GameService,
    private profileService: ProfileService,
    private router: Router,
    private el: ElementRef
  ) {}

  @Input() user?: User;
  @Input() currentUser?: User
  @Input() channel?: Channel

  userStatus?: number;

  currentUserBlockedList: User[] = []

  isDropdownSelected: boolean = false;

  inviteGameMode: number = 1

  ngOnInit(): void {
    this.chatService.requestBlockedUsers()
    this.chatService.getBlockedUsers()
      .subscribe(blocked => this.currentUserBlockedList = blocked)

    this.profileService.statusListener()
    .subscribe(status => {
      this.userStatus = status
    })

    if (this.user) {
      this.profileService.requestStatus(this.user?.id)
    }
  }

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

  // userIsAdmin(): boolean {
  //   return this.channel?.admins?.some(admin => admin.id === this.user?.id) || false
  // }

  userIsAdmin(): boolean {
    return this.user?.adminAt?.some(chaine => chaine.id === this.channel?.id) || false
  }

  currentIsAdmin(): boolean {
    return this.channel?.admins?.some(admin => admin.id === this.currentUser?.id) || false
  }

  userIsBlocked(): boolean {
    return this.currentUserBlockedList.some(blockedUser => blockedUser.id === this.user?.id) || false
  }

  /* EASY: 1, MEDIUM: 2, HARD: 3 */
  toggleGameMode(event: Event) {
    event.stopPropagation()
    if (this.inviteGameMode < 3) {
      this.inviteGameMode++
    } else {
      this.inviteGameMode = 1
    }
  }

  sendGameInvite() {
    if (!this.user) return
    console.log(this.userStatus)
    if (this.userStatus === 2 || this.userStatus === 0) {
      this.chatService.generateAchtung("User is either in a game or not online.")
      return
    }
    this.chatService.sendDM(this.user.id, "Hey, I'd like to play a game with you", GAME_INVITE, this.inviteGameMode)
    this.router.navigate(['/game'], {
      queryParams: {
        invite: true,
        accept: false,
        userId: this.user.id,
        level: this.inviteGameMode
      }
    });
  }

  manageUserModeration(action: string) {
    if (!this.user || !this.channel) return // Just a check for typescript
    this.chatService.manageUserModeration(action, this.user.id, this.channel?.id)
    this.isDropdownSelected = false
  }
}
