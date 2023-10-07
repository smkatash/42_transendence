import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-twofactorauth',
  templateUrl: './twofactorauth.component.html',
  styleUrls: ['./twofactorauth.component.css']
})
export class TwofactorauthComponent {
  @Input() showDialog: boolean = false
  @Output() showDialogChange = new EventEmitter<boolean>

  verificationStep: string = 'sendEmail'

  email: string = ''
  code: string = ''

  sendEmail(): void {
    this.verificationStep = 'sendCode'
  }

  verifyEmail(): void {
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
