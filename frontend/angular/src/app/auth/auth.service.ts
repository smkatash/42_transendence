import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { Observable, map } from 'rxjs';
import { ChatSocket } from '../app.module';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, @Inject(DOCUMENT) private document: Document,
              private chatSocket: ChatSocket) { };

  domain: string = 'http://127.0.0.1:3000'

  login(): void {
    this.document.location.href = `${this.domain}/42auth/login`
  }

  logout(): void {
    const url = `${this.domain}/42auth/logout`
    /** dc chat socket*/
    this.chatSocket.disconnect();
    this.http.get(url, { withCredentials: true }).subscribe()
  }

  isUserLoggedIn(): Observable<boolean> {
    const url = `${this.domain}/42auth/test`
    return this.http.get<any>(url, { withCredentials: true }).pipe(
      map(response => {
        return response && response.message === 'OK'
      })
    )
  }
}
