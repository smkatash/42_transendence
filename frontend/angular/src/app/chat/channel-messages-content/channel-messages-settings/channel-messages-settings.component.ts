import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChatService } from '../../chat.service';
import { Channel, User } from 'src/app/entities.interface';
import { Observable } from 'rxjs';

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

  constructor(private chatService: ChatService){ };

  @Input() isOpen?: boolean
  @Output() isOpenChange = new EventEmitter<boolean>
  @Input() channel?: Channel
  @Output() channelChangeEvent = new EventEmitter<Channel>
  users$: Observable<User[]> = this.chatService.getChannelUsers()

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

  toggle(): void {
    this.isOpen = !this.isOpen;
    this.isOpenChange.emit(this.isOpen);
  }
}
