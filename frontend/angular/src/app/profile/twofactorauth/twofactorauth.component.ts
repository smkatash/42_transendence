import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProfileService } from '../profile.service';
import { concatMap, switchMap } from 'rxjs';

@Component({
  selector: 'app-twofactorauth',
  templateUrl: './twofactorauth.component.html',
  styleUrls: ['./twofactorauth.component.css']
})
export class TwofactorauthComponent {
  constructor(private profileService: ProfileService) { }

  @Input() showDialog: boolean = false
  @Output() showDialogChange = new EventEmitter<boolean>

  verificationStep: string = 'sendEmail'

  email: string = ''
  code: string = ''

  sendEmail(): void { // TODO: make clean
    this.profileService.enable2FA(this.email)
      .subscribe(user1 => {
        console.log(user1)
        console.log('Now we are sending the email')
        this.profileService.enableSend2FA()
          .subscribe(user2 => {
            console.log('this is the other user')
            console.log(user2)
          })
      })
    this.verificationStep = 'sendCode'
  }

  verifyEmail(): void {
    this.profileService.verificationEnable2FA(this.code)
      .subscribe()
    this.verificationStep = 'verified'
  }

  closeDialog(): void {
    this.verificationStep = 'sendEmail'
    this.email = ''
    this.code = ''
    this.showDialog = false
    this.showDialogChange.emit(this.showDialog)
  }

}
