import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(private http: HttpClient, @Inject(DOCUMENT) private document: Document) { };

  getLogin(){
    this.document.location.href = 'http://localhost:3000/42auth/login'
  }
}
