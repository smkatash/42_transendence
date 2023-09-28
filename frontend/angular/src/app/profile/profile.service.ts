import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Match, User, UserFriend, UserMatches } from '../entities.interface';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private http: HttpClient) { }

  getProfile(userID: number): Observable<User> {
    const url = `api/users/${userID}`
    return this.http.get<User>(url)
  }

  getFriends(userID: number): Observable<User[]> {
    const url = `api/friends/${userID}`
    return this.http.get<UserFriend>(url)
      .pipe(
        map((userFriend: UserFriend) => userFriend.friends)
      )
  }

  getMatches(userID: number): Observable<Match[]> {
    const url = `api/matches/${userID}`
    return this.http.get<UserMatches>(url)
      .pipe(
        map((userMatches: UserMatches) => userMatches.matches)
      )
  }
}
