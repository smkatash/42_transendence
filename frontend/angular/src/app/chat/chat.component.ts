import { Component, OnInit } from '@angular/core';
import { ChatService } from './chat.service';
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
  channelToCreate?: string // type of channel to create
  isChannelToCreateActive: boolean = false

  passwordToJoinChannel?: string

  ngOnInit(): void {
    this.chatService.requestUserChannels()
    this.chatService.requestChannels()
    this.chatService.onError()
  }

  onChannelSelect(channel: Channel) {
    this.selectedChannel = channel
    if (this.selectedTab === 'available-chats') {
      if (this.selectedChannel.protected) {
        // Get the password
      }
      this.chatService.joinChannel({
        id: this.selectedChannel.id,
        password: this.passwordToJoinChannel
      })
      this.selectTab('my-chats')
      this.selectedChannel = channel
    }
    this.chatService.requestChannelMessages(channel.id)
  }

  createNewChannel(channelType: string) {
    this.channelToCreate = channelType
    console.log(channelType)
    this.isChannelToCreateActive = true
  }

  selectTab(tab: string) {
    if (tab === 'my-chats') {
      this.selectedTab= 'my-chats'
      this.selectedChannel = undefined
      this.chatService.requestUserChannels()
    } else {
      this.selectedTab= 'available-chats'
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
