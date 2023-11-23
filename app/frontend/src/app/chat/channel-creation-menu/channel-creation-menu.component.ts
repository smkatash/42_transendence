import { Component, EventEmitter, Input, Output } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChatService } from '../chat.service';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs';
import { User } from 'src/app/entities.interface';

@Component({
  selector: 'app-channel-creation-menu',
  templateUrl: './channel-creation-menu.component.html',
  styleUrls: ['./channel-creation-menu.component.css'],
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
export class ChannelCreationMenuComponent {

  constructor(private chatService: ChatService){}

  @Input() channelType?: string;
  @Input() isOpen?: boolean;
  @Output() isOpenChange = new EventEmitter<boolean>;

  channelName: string = ''
  channelPassword?: string

  userSearch = new FormControl()
  searchedUsers?: User[]
  selectedUser?: User
  messageToSend?: string

  ngOnInit() {
    this.userSearch.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(
        (username: string) => this.chatService.findUser(username)
        .pipe(
          tap((users: User[]) => {
            this.searchedUsers = users
            console.log(users)
          })
        )
      )
    ).subscribe()
  }

  selectUser(selected: User) {
    this.selectedUser = selected
    this.userSearch.reset()
  }

  sendMessage(): void {
    if (this.messageToSend === undefined) return
    this.messageToSend = this.messageToSend.trim()

    if (!this.messageToSend || !this.selectedUser) return
    this.chatService.sendDM(this.selectedUser?.id, this.messageToSend)
    this.messageToSend = ''
    this.toggle()
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    this.isOpenChange.emit(this.isOpen);
  }

  createChannel(): void {
    if (!this.channelType) return // Just for typescript

    this.chatService.createChannel({
       name: this.channelName,
       type: this.channelType,
       private: this.channelType === 'private',
       password: this.channelPassword
    })
    this.channelName = ''
    this.channelPassword = ''
    this.toggle()
  }
}
