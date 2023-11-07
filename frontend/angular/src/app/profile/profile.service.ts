import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Match, Stats, User, UserProfile } from '../entities.interface';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private http: HttpClient) { }

  domain: string = 'http://127.0.0.1:3000'

  getCurrentUser(): Observable<User> {
    const url = `${this.domain}/user/profile`
    return this.http.get<User>(url, { withCredentials: true })
  }

  getUser(userID: string): Observable<User> {
    const url = `${this.domain}/user/profile/${userID}`
    return this.http.get<User>(url, { withCredentials: true })
  }

  getCurrentUserFriends(): Observable<User[]> {
    const url = `${this.domain}/user/friends`
    return this.http.get<User[]>(url, { withCredentials: true })
  }

  getCurrentUserSentRequests(): Observable<User[]> {
    const url = `${this.domain}/user/friends/requests`
    return this.http.get<User[]>(url, { withCredentials: true })
  }

  getCurrentUserReceivedRequests(): Observable<User[]> {
    const url = `${this.domain}/user/friends/pending`
    return this.http.get<User[]>(url, { withCredentials: true })
  }

  getFriends(userID: string): Observable<User[]> {
    const url = `${this.domain}/user/${userID}/friends`
    return this.http.get<User[]>(url, { withCredentials: true })
  }

  setAvatar(formData: FormData): Observable<User> {
    const url =`${this.domain}/user/image/upload`
    return this.http.post<User>(url, formData, { withCredentials: true })
  }

  setName(username: string): void {
    const url =`${this.domain}/user/username`
    this.http.patch(url, {username: username}, { withCredentials: true }).subscribe()
  }

  setTitle(title: string): void {
    const url =`${this.domain}/user/title`
    this.http.patch(url, {title: title}, { withCredentials: true }).subscribe()
  }

  sendRequest(friendID: string): Observable<any> {
    const url =`${this.domain}/user/request-friend`
    return this.http.post<any>(url, { friendId: friendID}, { withCredentials: true }) // Post with ID in the body
  }

  acceptRequest(friendID: string): Observable<User> {
    const url =`${this.domain}/user/add-friend`
    return this.http.patch<User>(url, { friendId: friendID}, { withCredentials: true }) // Patch with ID in the body
  }

  declineRequest(friendID: string): Observable<User> {
    const url =`${this.domain}/user/decline-friend`
    return this.http.patch<User>(url, { friendId: friendID}, { withCredentials: true }) // Patch with ID in the body
  }

  removeFriend(friendID: string): Observable<any> {
    const url =`${this.domain}/user/friend/${friendID}`
    return this.http.delete<any>(url, { withCredentials: true })
  }

  getCurrentUserRank(): Observable<number> {
    const url = `${this.domain}/ranking/level`
    return this.http.get<number>(url, { withCredentials: true })
  }

  getRank(userID: string): Observable<number> {
    const url = `${this.domain}/ranking/${userID}/level`
    return this.http.get<number>(url, { withCredentials: true })
  }

  getCurrentUserStats(): Observable<Stats> {
    const url = `${this.domain}/ranking/stats`
    return this.http.get<Stats>(url, { withCredentials: true })
  }

  getStats(userID: string): Observable<Stats> {
    const url = `${this.domain}/ranking/${userID}/stats`
    return this.http.get<Stats>(url, { withCredentials: true })
  }

  getCurrentUserHistory(): Observable<Match[]> {
    const url = `${this.domain}/ranking/history`
    return this.http.get<Match[]>(url, { withCredentials: true })
  }

  getHistory(userID: string): Observable<Match[]> {
    const url = `${this.domain}/ranking/${userID}/history`
    return this.http.get<Match[]>(url, { withCredentials: true })
  }

  enable2FA(email: string): Observable<User> {
    const url = `${this.domain}/user/enable-mfa`
    return this.http.patch<User>(url, {email: email}, { withCredentials: true })
  }

  disable2FA(): Observable<User> {
    const url = `${this.domain}/user/disable-mfa`
    return this.http.patch<User>(url, {}, { withCredentials: true })
  }

  enableSend2FA(): Observable<User>{
    const url = `${this.domain}/42auth/send-code-mfa`
    return this.http.get<User>(url, { withCredentials: true })
  }

  verificationEnable2FA(code: string): Observable<User> {
    const url = `${this.domain}/42auth/verify-mfa`
    return this.http.post<User>(url, {code: code}, { withCredentials: true })
  }

}
