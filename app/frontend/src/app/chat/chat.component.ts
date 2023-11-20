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

  passwordToJoinChannel?: string

  channelCreationPopup: boolean = false
  passwordInputPopup: boolean = false

  errorMessage?: any

  ngOnInit(): void {
    this.chatService.requestUserChannels()
    this.chatService.requestChannels()
    this.chatService.onError()
      .subscribe(error => {
        this.displayError(error.message)
        console.error(error)
      })
  }

  onChannelSelect(channel: Channel) {
    if (channel.id === this.selectedChannel?.id) return

    this.selectedChannel = channel
    if (this.selectedTab === 'available-chats') {
      if (this.selectedChannel.protected) {
        this.passwordInputPopup = true
        this.channelCreationPopup = false
      } else {
        this.chatService.joinChannel({
          id: this.selectedChannel.id,
          password: this.passwordToJoinChannel
        })
      }
    } else {
      this.chatService.requestChannelMessages(channel.id)
    }
  }

  createNewChannel(channelType: string) {
    this.channelToCreate = channelType
    // this.selectTab('my-chats')
    this.channelCreationPopup = true
    this.passwordInputPopup = false
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

  displayError(message: any) {
    this.errorMessage = message
    setTimeout(() => {
      this.errorMessage = undefined
    }, 5000)
  }

}
