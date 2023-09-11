import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChatService } from '../../chat.service';
import { User } from 'src/app/user';

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
export class ChannelMessagesSettingsComponent implements OnChanges{

  constructor(private chatService: ChatService){ };

  @Input() isOpen?: boolean;
  @Output() isOpenChange = new EventEmitter<boolean>;
  @Input() channelId?: number;
  users: User[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['channelId'] && this.channelId) {
      this.getChannelUsers(this.channelId);
    }
  }

  getChannelUsers(id: number): void{
    this.chatService.getChannelUsers(id)
      .subscribe((users) => {
        this.users = users;
      })
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    this.isOpenChange.emit(this.isOpen);
  }
}
