import { Component } from '@angular/core';
import { LoginService } from './login.service';
import { Observable } from 'rxjs';
import { TestBed } from '@angular/core/testing';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(private loginService: LoginService) { };

  login(): void {
    this.loginService.getLogin()
  }

}
