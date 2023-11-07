import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { ProfileService } from '../profile.service';

@Component({
  selector: 'app-twofactorauth',
  templateUrl: './twofactorauth.component.html',
  styleUrls: ['./twofactorauth.component.css']
})
export class TwofactorauthComponent {
  constructor(private profileService: ProfileService, private cd: ChangeDetectorRef) { }

  @Input() showDialog: boolean = false
  @Output() closeDialogEvent = new EventEmitter<boolean>

  verificationStep: string = 'sendEmail'

  email: string = ''
  code: string = ''

  sendEmail(): void { // TODO: make clean
    this.profileService.enable2FA(this.email)
      .subscribe(_=>
        this.profileService.enableSend2FA().subscribe()
      )
    this.verificationStep = 'sendCode'
    this.cd.detectChanges();
  }

  verifyEmail(): void {
    this.profileService.verificationEnable2FA(this.code)
      .subscribe(something => console.log(something)) // TODO: Check if it as been actually verified or not
    this.verificationStep = 'verified'
  }

  closeDialog(): void {
    this.verificationStep = 'sendEmail'
    this.email = ''
    this.code = ''
    this.showDialog = false
    this.closeDialogEvent.emit(this.showDialog)
  }

}
