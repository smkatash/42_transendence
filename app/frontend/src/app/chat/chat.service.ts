import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Channel, ChannelUsers, CreateChannelInfo, JoinChannelInfo, Message, User } from '../entities.interface';
import { ChatSocket } from '../app.module';
import { ACCEPT_PRIVATE_INVITE, ACHTUNG, ADD_ADMIN, BAN, BLOCK, BLOCKED_USERS, CHANNELS, CHANNEL_MESSAGES, CHANNEL_USERS, CREATE, DECLINE_PRIVATE_INVITE, DIRECT, ERROR, INVALIDATE_MESSAGE_CONTENT, JOIN, KICK, LEAVE, MESSAGE, MUTE, PASSWORD, REM_ADMIN, SUCCESS, UNBAN, UNBLOCK, UNMUTE, USER_CHANNELS } from './subscriptions-events-constants'
import { HOST_IP } from '../Constants';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(
    private http: HttpClient,
    private socket: ChatSocket
  ) {}

  domain: string = HOST_IP

  findUser(username: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.domain}/api/user/find-by-username?username=${username}`, { withCredentials: true })
  }

  /* <---------- Socket emits ----------> */

  requestChannels() {
    this.socket.emit(CHANNELS)
  }

  requestUserChannels() {
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

  passwordModeration(action: string, channelID: number, password: string, oldPassword?: string) {
    if (action === 'add') {
      this.socket.emit(PASSWORD, { cId: channelID, newPass: password })
    } else if (action === 'remove'){
      this.socket.emit(PASSWORD, { cId: channelID, oldPass: password })
    } else { // change
      this.socket.emit(PASSWORD, { cId: channelID, oldPass: oldPassword, newPass: password })
    }
  }

  acceptPrivateInvite(channelID: string, msgID: number) {
    this.socket.emit(ACCEPT_PRIVATE_INVITE, { cId: Number(channelID), msgId: msgID })
  }

  declineChannelInvite(channelID: string, msgID: number) {
    this.socket.emit(DECLINE_PRIVATE_INVITE, { cId: Number(channelID), msgId: msgID })
  }

  invalidateMessage(messageID: number) {
    this.socket.emit(INVALIDATE_MESSAGE_CONTENT, { cId: messageID })
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

  // Communication problem. inviteId is actually either the invite to private channel or a game mode
  sendDM(userID: string, message: string, inviteType?: string, inviteId?: number) {
    this.socket.emit(DIRECT, { uId: userID, text: message, inviteType: inviteType, inviteId: inviteId })
  }

  requestBlockedUsers() {
    this.socket.emit(BLOCKED_USERS)
  }

  manageUserModeration(action: string, userID: string, channelID?: number) {
    switch(action) {
      case BLOCK:
        this.socket.emit(BLOCK, {uId: userID})
        break

      case UNBLOCK:
        this.socket.emit(UNBLOCK, {uId: userID})
        break

      case MUTE:
        this.socket.emit(MUTE, { cId: channelID, uId: userID })
        break

      case BAN:
        this.socket.emit(BAN, { cId: channelID, uId: userID })
        break

      case UNBAN:
        this.socket.emit(UNBAN, { cId: channelID, uId: userID })
        break

      case KICK:
        this.socket.emit(KICK, { cId: channelID, uId: userID })
        break

      case ADD_ADMIN:
        this.socket.emit(ADD_ADMIN, { cId: channelID, uId: userID })
        break

      case REM_ADMIN:
        this.socket.emit(REM_ADMIN, { cId: channelID, uId: userID })
        break

      default:
        break
    }
  }

  /* This is a state of the art technique to generate errors */
  generateAchtung(msg: string) {
    this.socket.emit(ACHTUNG, { uId: msg })
  }

  /* <---------- Events to listen to ----------> */

  onError() {
    return this.socket.fromEvent<any>(ERROR)
  }


  onSuccess() {
    return this.socket.fromEvent<any>(SUCCESS)
  }

  getUsersChannels(): Observable<Channel[]> {
    return this.socket.fromEvent<Channel[]>(USER_CHANNELS)
  }

  getChannels(): Observable<Channel[]> {
    return this.socket.fromEvent<Channel[]>(CHANNELS)
  }

  getChannelUsers(): Observable<ChannelUsers> {
    return this.socket.fromEvent<ChannelUsers>(CHANNEL_USERS)
  }

  getChannelMessages(): Observable<Message[]> {
    return this.socket.fromEvent<Message[]>(CHANNEL_MESSAGES)
  }

  getIncomingMessages(): Observable<Message> {
    return this.socket.fromEvent<Message>(MESSAGE)
  }

  getBlockedUsers(): Observable<User[]> {
    return this.socket.fromEvent<User[]>(BLOCKED_USERS)
  }
}
