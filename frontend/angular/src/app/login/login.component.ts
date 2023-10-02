import { Component, INJECTOR, inject, runInInjectionContext } from '@angular/core';
import { LoginService } from './login.service';
import { Observable } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { hostIp } from 'src/config';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(private loginService: LoginService, private router: Router/* , @Inject(DOCUMENT) private document: Document */) { };

  login(): void {
    this.loginService.getLogin()
  }

}
