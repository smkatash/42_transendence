import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NavbarComponent } from './navbar/navbar.component';
import { RouterModule } from '@angular/router';
import { ErrorMessageComponent } from './error-message/error-message.component';

@NgModule({
  imports: [
    CommonModule, RouterModule
  ],
  declarations: [
    NavbarComponent,
    ErrorMessageComponent,
    ErrorMessageComponent
  ],
  exports: [
    NavbarComponent, ErrorMessageComponent, CommonModule
  ]
})
export class SharedModule { }
