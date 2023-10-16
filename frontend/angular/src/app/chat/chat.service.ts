import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Channel, Message, User } from '../entities.interface';
import { ChatSocket } from '../app.module';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(
    private http: HttpClient,
    private socket: ChatSocket
  ) { }

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
     * messing up with Jad's odcs
     **/
    connectSocket() {
      this.socket.connect();
    }
    sendMessage() {
      return
    }

    getMessage()  {
      return console.log(this.socket.fromEvent('message'))
    }
}
