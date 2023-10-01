import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { hostIp } from 'src/config';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(private http: HttpClient) { };

  loginUrl = `${hostIp}:3000/42auth/login`;
  getLogin(): Observable<Object>{
    return this.http.get<Object>(this.loginUrl, { withCredentials: true })
  }
}
