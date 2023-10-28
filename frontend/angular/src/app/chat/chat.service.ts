import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Channel, JoinChannelInfo, Message, User } from '../entities.interface';
import { ChatSocket } from '../app.module';
// import  { MatSnackBar} from '@angular/material/snack-bar'

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(
    private http: HttpClient,
    private socket: ChatSocket,
    // private snackBar: MatSnackBar
  ) { }
  
  domain: string = 'http://127.0.0.1:3000';

  //all existing channels
  getChannels(): Observable<Channel[]> {
    // const url = 'api/channels';
    const url = 'http://127.0.0.1:3000/chat/all'
    return this.http.get<Channel[]>(url, {
      withCredentials: true
    })
      .pipe(
        catchError(this.handleError<Channel[]>('getChannels', []))
        )
      }

    //channels, that user is on
    getUsersChannels(): Observable<Channel[]> {
    // const url = 'api/channels';
    const url = 'http://127.0.0.1:3000/chat'
    return this.http.get<Channel[]>(url, {
      withCredentials: true
    })
      .pipe(
        catchError(this.handleError<Channel[]>('getChannels', []))
        )
      }
    
    //tmp gonna
    //TODO kill jad
    createPublicChannel(name: string) {
      console.log(name)
      // const url =`${this.domain}/chat/create-public`
      // console.log(url)
      const channelInfo = {
        name: name,
        private: false
      }
      this.createChannel(channelInfo)
      // this.http.post<Channel>(url, {name: name, private: false}, { withCredentials: true }).subscribe()
    }

    bubu(){
      console.log("bubu clicked")
      
    }

  // getChannelMessages(channelId: number): Observable<Message[]> {
  //   const url = `api/messages/${channelId}`;
  //   return this.http.get<ChannelMessages>(url)
  //     .pipe(
  //       catchError(this.handleError<ChannelMessages>('getChannelMessages', {id: 0, messages: []})),
  //       map((channelMessages: ChannelMessages) => channelMessages.messages)
  //       )
  // }

  // getChannelUsers(channelId: number): Observable<User[]> {
  //   const url = `api/channelUsers/${channelId}`;
  //   return this.http.get<ChannelUsers>(url)
  //     .pipe(
  //       catchError(this.handleError<ChannelUsers>('getChannelUsers', {id: 0, users: []})),
  //       map((channelUsers: ChannelUsers) => channelUsers.users)
  //       )
  // }

  /* Handle HTTP operation that failed and let the app continue. */
  private handleError<T>(operation = 'operation', result?:T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      // TODO: find a way to display the error to user. Or not. dk yet.
      return of(result as T);
    }
  }

    /**
     * messing up with Jad's ocds
     **/
    connectSocket() {
      this.socket.connect();
    }

    getMessage()  {
      return this.socket.fromEvent('message')
    }

    getUsersChannelsS()  {
      return this.socket.fromEvent<Channel[]>('getUsersChannels')
    }

    askForChannels()  {
      this.socket.emit('getAllChannels');
    }
    getChannelsS() {
      return this.socket.fromEvent<Channel[]>('allChannels')
    }

    createChannel(chanelInfo: Channel) {
      this.socket.emit('createChannel', chanelInfo)
    }

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

    findUser(username: string): Observable<User[]>  {
      return this.http.get<User[]>(`${this.domain}/user/find-by-username?username=${username}`)
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

    askForChannelMessages(channel: Channel) {
      this.socket.emit('getChannelMessages', channel);
    }
    getChannelMessages(): Observable<Message[]>  {
      return this.socket.fromEvent<Message[]>('channelMessages')
    }
}
