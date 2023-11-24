import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChatService } from '../../chat.service';
import { Channel, User } from 'src/app/entities.interface';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs';
import { ProfileService } from 'src/app/profile/profile.service';
import { FormControl } from '@angular/forms';
import { CHANNEL_INVITE } from '../../subscriptions-events-constants';

@Component({
  selector: 'app-channel-messages-settings',
  templateUrl: './channel-messages-settings.component.html',
  styleUrls: ['./channel-messages-settings.component.css'],
  animations: [
    trigger('openClose', [
      state('open', style({
        width: '40%',
        right: '0%'
      })),
      state('closed', style({
        width: '40%',
        right: '-42%'
      })),
      transition('open <=> closed', [
        animate('.7s cubic-bezier(.49,.07,.39,.93)'),
      ]),
    ]),
  ],
})
export class ChannelMessagesSettingsComponent implements OnChanges {

  constructor(
    private chatService: ChatService,
    private profileService: ProfileService
  ){ };

  @Input() isOpen?: boolean
  @Output() isOpenChange = new EventEmitter<boolean>
  @Input() channel?: Channel
  @Output() channelChangeEvent = new EventEmitter<Channel | undefined>

  users: User[] = []
  currentUser?: User

  channelPassword?: string // password being inputted in case of adding/changing/removing

  privateUserSearch = new FormControl()
  searchedUsers: User[]

  ngOnInit() {
    this.profileService.getCurrentUser()
      .subscribe(user => this.currentUser = user)

    if (this.channel) {
      this.chatService.requestChannelUsers(this.channel.id)
      this.chatService.getChannelUsers()
        .subscribe(channelUsers => {
          if (channelUsers.cId === this.channel?.id) {
            this.users = channelUsers.users
          }
        })
    }

    this.privateUserSearch.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(
        (username: string) => this.chatService.findUser(username)
        .pipe(
          tap((users: User[]) => this.searchedUsers = users)
        )
      )
    ).subscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['channel'] && this.channel) {
      this.chatService.requestChannelUsers(this.channel.id)
    }
  }

  exitChannel(): void {
    if (!this.channel) return // A check for typescript

    this.chatService.exitChannel(this.channel.id)
    this.toggle()
    this.channel = undefined
    this.channelChangeEvent.emit(this.channel)
  }

  sendInviteToChannel(userID: string) {
    this.searchedUsers = []
    this.privateUserSearch.reset()
    this.chatService.sendDM(userID, `Hey, I'm inviting you to a super cool secret channel called ${this.channel?.name}`, CHANNEL_INVITE, this.channel?.id)
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    this.isOpenChange.emit(this.isOpen);
  }

  canManagePassword(): boolean {
    return this.channel?.type === 'protected' && this.channel?.owner?.id === this.currentUser?.id
  }

  canAddPassword(): boolean {
    return (this.channel?.type === 'public' || this.channel?.type === 'private') && this.channel?.owner?.id === this.currentUser?.id
  }

  passModeration(action: string) {
    if (!this.channel || !this.channelPassword) return
    console.log("emitting to backend")
    console.log(action)
    console.log(this.channelPassword)
    console.log(this.channel.id)
    this.chatService.passwordModeration(action, this.channel.id, this.channelPassword)
  }
}
