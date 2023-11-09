import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, @Inject(DOCUMENT) private document: Document) { };

  domain: string = 'http://127.0.0.1:3000'

  login(): void {
    this.document.location.href = `${this.domain}/42auth/login`
  }

  logout(): void {
    this.document.location.href = `${this.domain}/42auth/logout`
  }

  mfaLogin(code: string): Observable<any> {
    console.log('sending ' + code)
    const response = this.http.post<any>(`${this.domain}/42auth/login-verify-mfa`, { code: code }, { withCredentials: true })
    console.log(response)
    return response
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
