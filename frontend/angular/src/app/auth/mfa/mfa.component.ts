import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mfa',
  templateUrl: './mfa.component.html',
  styleUrls: ['./mfa.component.css']
})
export class MfaComponent {

  constructor(private auth: AuthService, private route: Router){}

  code: string = ''

  submit() {
    this.auth.mfaLogin(this.code)
      .subscribe({
        next: res => {
          if (res.message === 'Success') {
            this.route.navigate(['/profile'])
          }
        },
        error: () => alert('Wrong code, try again')
    })
  }
}
