import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChatService } from '../chat.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { User } from 'src/app/entities.interface';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs';
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
  constructor(private chatService: ChatService ){ };

    @Input() isOpen?: boolean;
    @Output() isOpenChange = new EventEmitter<boolean>
    isDropdownOpen?: boolean=false;
    messageToSend?: string;
    userSearch = new FormControl()
    searchedUsers: User[]
    selectedUser: User;

  ngOnInit() {

    this.userSearch.valueChanges.pipe(
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

  toggle(): void {
    this.isOpen = !this.isOpen;
    this.isOpenChange.emit(this.isOpen)
  }

  sendMessage(): void {
    if (this.messageToSend === undefined) return
    this.messageToSend = this.messageToSend.trim();

    if (!this.messageToSend) return;
    this.chatService.sendDM(this.selectedUser.id, this.messageToSend);
    this.messageToSend = ''
    this.toggle()
  }
  selectUser(selected: User) {
    this.selectedUser = selected;
    this.isDropdownOpen = false;
  }
}
