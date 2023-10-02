import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Match, User } from '../entities.interface';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private http: HttpClient) { }

  getSessionUser(): Observable<User> {
    const url = 'http://10.13.3.6:3000/user/info'
    return this.http.get<User>(url, { withCredentials: true })
  }

  getFriends(userID: string): Observable<User[]> {
    const url = `http://10.13.3.6:3000/user/${userID}/friends`
    return this.http.get<User[]>(url, { withCredentials: true })
  }

  // getMatches(userID: number): Observable<Match[]> {
  //   const url = `http://172.18.0.4:3000/matches/${userID}`
  //   return this.http.get<UserMatches>(url)
  //     .pipe(
  //       map((userMatches: UserMatches) => userMatches.matches)
  //     )
  // }
}
