import { Component, OnInit } from '@angular/core';

import { ChatService } from './chat.service';

import { ChannelCreateType } from './chat.enum';
import { Channel, Message } from '../entities.interface';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})

export class ChatComponent implements OnInit {

  constructor(private chatService: ChatService){ }

  test = this.chatService.getMessage();
  // channels: Channel[] = [];
  // messages$: Observable<Message[]> = []
  channels$: Observable<Channel[]> = this.chatService.getChannelsS();
  selectedChannel?: Channel;
  channelToCreate?: ChannelCreateType;
  isChannelToCreateActive: boolean = false;

  ngOnInit(): void {
    this.chatService.connectSocket();
    this.chatService.askForChannels();
    // this.channels$ = this.chatService.getChannelsS();
    //
    // this.chatService.sendMessage();
    // this.chatService.createChannel()
  }

  // getChannels(): void {
  //   this.chatService.getChannels()
  //   // this.chatService.getUsersChannels()
  //       .subscribe((channels: Channel[]) => this.channels = channels);
  // }

  onChannelSelect(channel: Channel) {
    this.selectedChannel = channel;
  }

  createNewChannel(channelType: ChannelCreateType) {
    this.channelToCreate = channelType;
    this.isChannelToCreateActive = true;
  }

  publicChannelNameEmitted(channelName: string) {
    this.chatService.createPublicChannel(channelName);
  }
  bubuEmitted(bubu: string){
    console.log(bubu)
  }

  onError() {
    this.chatService.onError()
  }

  // getMessage()  {
  //   return this.chatService.getMessage()
  // }
}
