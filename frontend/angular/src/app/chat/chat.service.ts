import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { Channel } from './sidebar-channel/channel';
import { ChannelMessages } from './message/channel-messages';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(
    private http: HttpClient
    ) { }

  private channelsUrl = 'api/channels';
  getChannels(): Observable<Channel[]> {
    return this.http.get<Channel[]>(this.channelsUrl)
      .pipe(
        catchError(this.handleError<Channel[]>('getChannels', []))
      );
  }

    getChannelMessages(channelId: number): Observable<ChannelMessages> {
      const url = `api/messages/${channelId}`;
      return this.http.get<ChannelMessages>(url)
      .pipe(
        catchError(this.handleError<ChannelMessages>('getChannelMessages', {id: 0, messages: []})),
      );
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
