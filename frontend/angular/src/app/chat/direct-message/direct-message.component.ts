import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChatService } from '../chat.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { User } from 'src/app/entities.interface';
import { ProfileService } from 'src/app/profile/profile.service';
import { Observable, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs';
import { FormControl } from '@angular/forms';

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
  constructor(
    private chatService: ChatService,
    private profileService: ProfileService
    ){};

    @Input() isOpen?: boolean;
    @Output() isOpenChange = new EventEmitter<boolean>
    dd_open?: boolean=false;
    messageToSend?: string;
    users$: Observable<User[]> = this.chatService.getChannelUsers()
    currentUser?: User
    targetUser?:User;
    somePlaceholder:string = "Find the User"
    UserSearch = new FormControl()
    searchedUsers: User[]
    var1: string = "";

  ngOnInit() {
    this.profileService.getCurrentUser()
      .subscribe(user => this.currentUser = user)

    this.UserSearch.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(
        (username: string) => this.chatService.findUser(username)
        .pipe(
          tap((users: User[]) =>{
            this.searchedUsers = users
            console.log(users)
          })
        )
      )
    ).subscribe();

  }
  
  toggle(): void {
    this.isOpen = !this.isOpen;
    this.isOpenChange.emit(this.isOpen)
  }
  sendMessage(): void {
    if (this.messageToSend === undefined) return
    this.messageToSend = this.messageToSend.trim();

    if (!this.messageToSend) return;
    this.chatService.sendDM('userid',this.messageToSend);
    this.messageToSend = ''
    this.toggle()
  }
  selectUser(newUser:User)
  {
    // this.somePlaceholder=newUser.username;
    this.targetUser=newUser;
    this.var1 = newUser.username;
    this.dd_open = true;

  }
  toggle_dropdown(): void {
    this.dd_open = !this.dd_open;
  }
  resetInput()
  {
    this.UserSearch.reset();
  }
}
