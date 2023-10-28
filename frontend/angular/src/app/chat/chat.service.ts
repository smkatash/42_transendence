import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Channel, CreateChannelInfo, JoinChannelInfo, Message, User } from '../entities.interface';
import { ChatSocket } from '../app.module';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(
    private http: HttpClient,
    private socket: ChatSocket,
  ) { }

  domain: string = 'http://127.0.0.1:3000';

  createPublicChannel(name: string) {
    console.log(name)
    this.createChannel({ name: name, private: false })
  }

  findUser(username: string): Observable<User[]>  {
    return this.http.get<User[]>(`${this.domain}/user/find-by-username?username=${username}`)
  }


  /* <---------- Socket emits ----------> */

  requestChannels() {
    this.socket.emit('getAllChannels');
  }

  requestUsersChannels() {
    this.socket.emit('getUsersChannels')
  }

  createChannel(channelInfo: CreateChannelInfo) {
    this.socket.emit('createChannel', channelInfo)
  }

  joinChannel(joinInfo:  JoinChannelInfo) {
    this.socket.emit('join', joinInfo);
  }

  leaveChannel(joinInfo: JoinChannelInfo)  {
    this.socket.emit('leave', joinInfo)
  }

  sendMessage(message: Message) {
    this.socket.emit('message', message);
  }

  requestChannelMessages(channel: Channel) {
    this.socket.emit('getChannelMessages', channel);
  }

  /* <---------- Events to listen to ----------> */

  onError() {
    this.socket.on('error', (error: any) => {
      console.error('WebSocket Error:', error);
    });
  }

  onSuccess() {
    this.socket.on('success', (msg: any) => {
      console.log(msg)
    })
  }

  getMessage(): Observable<Message> {
    return this.socket.fromEvent<Message>('incMsg')
  }

  getUsersChannels(): Observable<Channel[]> {
    return this.socket.fromEvent<Channel[]>('usersChannels')
  }

  getChannels(): Observable<Channel[]> {
    return this.socket.fromEvent<Channel[]>('allChannels')
  }

  getChannelMessages(): Observable<Message[]> {
    return this.socket.fromEvent<Message[]>('channelMessages')
  }
}
