import { Component, OnInit } from '@angular/core';
import { ChatService } from './chat.service';
import { ChannelCreateType } from './chat.enum';
import { Channel } from '../entities.interface';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})

export class ChatComponent implements OnInit {

  constructor(private chatService: ChatService){ }

  selectedTab: string = 'my-chats'

  myChannels$: Observable<Channel[]> = this.chatService.getUsersChannels()
  allChannels$: Observable<Channel[]> = this.chatService.getChannels()
  selectedChannel?: Channel
  channelToCreate?: ChannelCreateType
  isChannelToCreateActive: boolean = false

  ngOnInit(): void {
    this.chatService.requestUsersChannels()
    this.chatService.requestChannels()
  }

  onChannelSelect(channel: Channel) {
    this.selectedChannel = channel
    this.chatService.requestChannelMessages(channel.id)
  }

  createNewChannel(channelType: ChannelCreateType) {
    this.channelToCreate = channelType
    this.isChannelToCreateActive = true
  }

  selectTab(tab: string) {
    if (tab === 'my-chats') {
      this.selectedTab= 'my-chats'
      this.selectedChannel = undefined
      this.chatService.requestUsersChannels()
    } else {
      this.selectedTab= 'all-chats'
      this.selectedChannel = undefined
      this.chatService.requestChannels()
    }
  }

  // onError() {
  //   this.chatService.onError()
  // }

  // getMessage()  {
  //   return this.chatService.getMessage()
  // }
}
