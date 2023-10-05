import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Match, Stats, User } from '../entities.interface';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private http: HttpClient) { }

  getSessionUser(): Observable<User> {
    const url = 'http://127.0.0.1:3000/user/info'
    return this.http.get<User>(url, { withCredentials: true })
  }

  getFriends(userID: string): Observable<User[]> {
    const url = `http://127.0.0.1:3000/user/${userID}/friends`
    return this.http.get<User[]>(url, { withCredentials: true })
  }

  getRank(userID: string): Observable<number> {
    const url = `http://127.0.0.1:3000/ranking/${userID}`
    return this.http.get<number>(url, { withCredentials: true })
  }

  getStats(): Observable<Stats> {
    const url = `http://127.0.0.1:3000/ranking/stats`
    return this.http.get<Stats>(url, { withCredentials: true })
  }

/*   getMatches(userID: string): Observable<Match[]> {
    const url = `http://127.0.0.1:3000/user/${userID}/matches`
    return this.http.get<Match[]>(url, { withCredentials: true })
  } */

  setAvatar(userID: string, formData: FormData): Observable<User> {
    const url =`http://127.0.0.1:3000/user/${userID}/upload`
    return this.http.post<User>(url, formData, { withCredentials: true })
  }

/*   sendRequest(friendID: string): void {
    const url =`http://127.0.0.1:3000/user/${friendID}/friend`
    const request$ = this.http.post<User>(url, { withCredentials: true })
    request$.subscribe()
  }

  removeFriend(userID: string, friendID: string): void {
    const url =`http://127.0.0.1:3000/user/${userID}/friend/${friendID}`
    const request$ = this.http.post<User>(url, { withCredentials: true })
    request$.subscribe()
  } */
}
