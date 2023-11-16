import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { Observable, map } from 'rxjs';
import { HOST_IP } from '../Constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, @Inject(DOCUMENT) private document: Document) { };

  domain: string = HOST_IP

  login(): void {
    this.document.location.href = `${this.domain}/api/42auth/login`
  }

  logout(): void {
    this.document.location.href = `${this.domain}/api/42auth/logout`
  }

  mfaLogin(code: string): Observable<any> {
    return this.http.post<any>(`${this.domain}/api/42auth/login-verify-mfa`, { code: code }, { withCredentials: true })
  }

  isUserLoggedIn(): Observable<boolean> {
    const url = `${this.domain}/api/42auth/test`
    return this.http.get<any>(url, { withCredentials: true }).pipe(
      map(response => {
        return response && response.message === 'OK'
      })
    )
  }
}
