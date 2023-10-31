import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { Channel, CreateChannelInfo, JoinChannelInfo, Message, User } from '../entities.interface';
import { ChatSocket } from '../app.module';
import { CHANNELS, CHANNEL_MESSAGES, CHANNEL_USERS, CREATE, ERROR, JOIN, LEAVE, MESSAGE, SUCCESS, USER_CHANNELS } from './subscriptions-events-constants'

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(
    private http: HttpClient,
    private socket: ChatSocket,
  ) { }

  domain: string = 'http://127.0.0.1:3000';

  findUser(username: string): Observable<User[]>  {
    return this.http.get<User[]>(`${this.domain}/user/find-by-username?username=${username}`)
  }


  /* <---------- Socket emits ----------> */

  requestChannels() {
    this.socket.emit(CHANNELS)
  }

  requestUsersChannels() {
    this.socket.emit(USER_CHANNELS)
  }

  requestChannelUsers(channelID: number) {
    this.socket.emit(CHANNEL_USERS, { cId: channelID })
  }

  createChannel(channelInfo: CreateChannelInfo) {
    this.socket.emit(CREATE, channelInfo)
  }

  joinChannel(joinInfo: JoinChannelInfo) {
    this.socket.emit(JOIN, joinInfo)
  }

  leaveChannel(joinInfo: JoinChannelInfo)  {
    this.socket.emit(LEAVE, joinInfo)
  }

  sendMessage(channelID: number, message: string) {
    this.socket.emit(MESSAGE, { cId: channelID, content: message })
  }

  requestChannelMessages(channelID: number) {
    this.socket.emit(CHANNEL_MESSAGES, { cId: channelID })
  }

  exitChannel(channelID: number) {
    this.socket.emit(LEAVE, { cId: channelID })
  }

  /* <---------- Events to listen to ----------> */

  onError() {
    this.socket.on(ERROR, (error: any) => {
      console.error('WebSocket Error:', error);
    });
  }

  onSuccess() {
    this.socket.on(SUCCESS, (msg: any) => {
      console.log(msg)
    })
  }

  getUsersChannels(): Observable<Channel[]> {
    return this.socket.fromEvent<Channel[]>(USER_CHANNELS)
  }

  getChannels(): Observable<Channel[]> {
    return this.socket.fromEvent<Channel[]>(CHANNELS)
  }

  getChannelUsers(): Observable<User[]> {
    return this.socket.fromEvent<User[]>(CHANNEL_USERS)
  }

  getChannelMessages(): Observable<Message[]> {
    return this.socket.fromEvent<Message[]>(CHANNEL_MESSAGES)
  }

  getIncomingMessages(): Observable<Message> {
    return this.socket.fromEvent<Message>(MESSAGE)
  }
}
