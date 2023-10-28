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
  }

  createNewChannel(channelType: ChannelCreateType) {
    this.channelToCreate = channelType
    this.isChannelToCreateActive = true
  }

  publicChannelNameEmitted(channelName: string) {
    this.chatService.createPublicChannel(channelName)
  }

  selectTab(tab: string) {
    if (tab === 'my-chats') {
      this.selectedTab= 'my-chats'
    } else {
      this.selectedTab= 'all-chats'
    }
  }

  // onError() {
  //   this.chatService.onError()
  // }

  // getMessage()  {
  //   return this.chatService.getMessage()
  // }
}
