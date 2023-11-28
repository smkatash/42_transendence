import { HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Match, Stats, User} from '../entities.interface';
import { UserSocket } from '../app.module';
import { USER_STATUS } from '../chat/subscriptions-events-constants';
import { HOST_IP } from '../Constants';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(
    private http: HttpClient,
    private userSocket: UserSocket
  ) { }

  domain: string = HOST_IP

  getCurrentUser(): Observable<User> {
    const url = `${this.domain}/api/user/profile`
    return this.http.get<User>(url, { withCredentials: true })
  }

  getUser(userID: string): Observable<User> {
    const url = `${this.domain}/api/user/profile/${userID}`
    return this.http.get<User>(url, { withCredentials: true })
  }

  getCurrentUserFriends(): Observable<User[]> {
    const url = `${this.domain}/api/user/friends`
    return this.http.get<User[]>(url, { withCredentials: true })
  }

  getCurrentUserSentRequests(): Observable<User[]> {
    const url = `${this.domain}/api/user/friends/requests`
    return this.http.get<User[]>(url, { withCredentials: true })
  }

  getCurrentUserReceivedRequests(): Observable<User[]> {
    const url = `${this.domain}/api/user/friends/pending`
    return this.http.get<User[]>(url, { withCredentials: true })
  }

  getFriends(userID: string): Observable<User[]> {
    const url = `${this.domain}/api/user/${userID}/friends`
    return this.http.get<User[]>(url, { withCredentials: true })
  }

  setAvatar(formData: FormData): Observable<User> {
    const url =`${this.domain}/api/user/image/upload`
    return this.http.post<User>(url, formData, { withCredentials: true })
  }

  setName(username: string): Observable<any> {
    const url =`${this.domain}/api/user/username`
    return this.http.patch<any>(url, {username: username}, { withCredentials: true })
  }

  setTitle(title: string): Observable<any> {
    const url =`${this.domain}/api/user/title`
    return this.http.patch<any>(url, {title: title}, { withCredentials: true })
  }

  sendRequest(friendID: string): Observable<any> {
    const url =`${this.domain}/api/user/request-friend`
    return this.http.post<any>(url, { friendId: friendID}, { withCredentials: true }) // Post with ID in the body
  }

  acceptRequest(friendID: string): Observable<User> {
    const url =`${this.domain}/api/user/add-friend`
    return this.http.patch<User>(url, { friendId: friendID}, { withCredentials: true }) // Patch with ID in the body
  }

  declineRequest(friendID: string): Observable<User> {
    const url =`${this.domain}/api/user/decline-friend`
    return this.http.patch<User>(url, { friendId: friendID}, { withCredentials: true }) // Patch with ID in the body
  }

  removeFriend(friendID: string): Observable<any> {
    const url =`${this.domain}/api/user/friend/${friendID}`
    return this.http.delete<any>(url, { withCredentials: true })
  }

  getCurrentUserRank(): Observable<number> {
    const url = `${this.domain}/api/ranking/level`
    return this.http.get<number>(url, { withCredentials: true })
  }

  getRank(userID: string): Observable<number> {
    const url = `${this.domain}/api/ranking/${userID}/level`
    return this.http.get<number>(url, { withCredentials: true })
  }

  getCurrentUserStats(): Observable<Stats> {
    const url = `${this.domain}/api/ranking/stats`
    return this.http.get<Stats>(url, { withCredentials: true })
  }

  getStats(userID: string): Observable<Stats> {
    const url = `${this.domain}/api/ranking/${userID}/stats`
    return this.http.get<Stats>(url, { withCredentials: true })
  }

  getCurrentUserHistory(): Observable<Match[]> {
    const url = `${this.domain}/api/ranking/history`
    return this.http.get<Match[]>(url, { withCredentials: true })
  }

  getHistory(userID: string): Observable<Match[]> {
    const url = `${this.domain}/api/ranking/${userID}/history`
    return this.http.get<Match[]>(url, { withCredentials: true })
  }

  enable2FA(email: string): Observable<User> {
    const url = `${this.domain}/api/user/enable-mfa`
    return this.http.patch<User>(url, {email: email}, { withCredentials: true })
  }

  disable2FA(): Observable<User> {
    const url = `${this.domain}/api/user/disable-mfa`
    return this.http.patch<User>(url, {}, { withCredentials: true })
  }

  enableSend2FA(): Observable<User>{
    const url = `${this.domain}/api/42auth/send-code-mfa`
    return this.http.get<User>(url, { withCredentials: true })
  }

  verificationEnable2FA(code: string): Observable<User> {
    const url = `${this.domain}/api/42auth/verify-mfa`
    return this.http.post<User>(url, {code: code}, { withCredentials: true })
  }

  statusListener(): Observable<number> {
    return this.userSocket.fromEvent<number>(USER_STATUS)
  }

  requestStatus(userID: string) {
    this.userSocket.emit(USER_STATUS, { id: userID })
  }

  getUserBlockedList(userID: string): Observable<User[]> {
    const url = `${this.domain}/api/user/${userID}/blocked`
    return this.http.get<User[]>(url, { withCredentials: true })
  }

}
