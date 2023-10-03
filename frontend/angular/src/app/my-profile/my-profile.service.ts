import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Match, User, UserFriend, UserMatches } from '../entities.interface';

@Injectable({
  providedIn: 'root'
})
export class MyProfileService {

  constructor(private http: HttpClient) { }

  getProfile(): Observable<any> {
    const url = `http://127.0.0.1:3000/user/info`
    return this.http.get<any>(url, { withCredentials: true })
  }

//   getFriends(userID: number): Observable<User[]> {
//     const url = `api/friends/${userID}`
//     return this.http.get<UserFriend>(url)
//       .pipe(
//         map((userFriend: UserFriend) => userFriend.friends)
//       )
//   }

//   getMatches(userID: number): Observable<Match[]> {
//     const url = `api/matches/${userID}`
//     return this.http.get<UserMatches>(url)
//       .pipe(
//         map((userMatches: UserMatches) => userMatches.matches)
//       )
//   }
}
