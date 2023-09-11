import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap, shareReplay } from 'rxjs/operators';
import { Channel } from './sidebar-channel/channel';
import { ChannelMessages } from './message/channel-messages';
import { Message } from './message/message';
import { User } from '../user';
import { ChannelUsers } from './channel-messages-content/channel-messages-settings/channel-user/channel-users';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(private http: HttpClient) { }

  private channelsUrl = 'api/channels';
  getChannels(): Observable<Channel[]> {
    return this.http.get<Channel[]>(this.channelsUrl)
      .pipe(
        catchError(this.handleError<Channel[]>('getChannels', []))
        );
      }

  getChannelMessages(channelId: number): Observable<Message[]> {
    const url = `api/messages/${channelId}`;
    return this.http.get<ChannelMessages>(url)
    .pipe(
      catchError(this.handleError<ChannelMessages>('getChannelMessages', {id: 0, messages: []})),
      map((channelMessages: ChannelMessages) => channelMessages.messages)
      );
    }

    getChannelUsers(channelId: number): Observable<User[]> {
      const url = `api/users/${channelId}`;
      return this.http.get<ChannelUsers>(url)
      .pipe(
        catchError(this.handleError<ChannelUsers>('getChannelUsers', {id: 0, users: []})),
        map((channelUsers: ChannelUsers) => channelUsers.users)
        )
  }

  /* Handle HTTP operation that failed and let the app continue. */
  private handleError<T>(operation = 'operation', result?:T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      // TODO: find a way to display the error to user. Or not. dk yet.
      return of(result as T);
    }
  }
}
