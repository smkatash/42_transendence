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

  sendEmail(): void {
    this.profileService.enable2FA(this.email)
      .subscribe(_=> this.profileService.enableSend2FA().subscribe())
	this.verificationStep = 'sendCode'
    this.cd.detectChanges();
  }

  verifyEmail(): void {
    this.profileService.verificationEnable2FA(this.code)
      .subscribe({
		next: () => this.verificationStep = 'verified',
		error: () => this.verificationStep = 'unverified'
	  })
  }

  closeDialog(): void {
    this.verificationStep = 'sendEmail'
    this.email = ''
    this.code = ''
    this.showDialog = false
    this.closeDialogEvent.emit(this.showDialog)
  }

}
