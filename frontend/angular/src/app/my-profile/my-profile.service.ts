import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { User, UserFriend } from '../entities.interface';

@Injectable({
  providedIn: 'root'
})
export class MyProfileService {

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

}
