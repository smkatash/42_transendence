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
    window.location.href = `http://${hostIp}:3000/42auth/login`
    // this.router.navigate(`http://${hostIp}:3000/42auth/login`, )
    // this.loginService.getLogin().subscribe({
    //   next: (response) => {
    //     // const sessionData = response
    //     // console.log(sessionData)
    //   },
    //   error: (error) => {
    //     console.error('Authentication failed:', error)
    //   },
    //   complete: () =>
    //   this.router.navigate(['/home'])
    // })
  }
}




























