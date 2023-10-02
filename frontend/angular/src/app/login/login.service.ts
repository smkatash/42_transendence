import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(private http: HttpClient, @Inject(DOCUMENT) private document: Document) { };

  loginUrl = '/api';
  getLogin(){
    this.document.location.href = 'http://127.0.0.1:3000/42auth/login'
  }
}
