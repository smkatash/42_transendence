import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NavbarComponent } from './navbar/navbar.component';
import { RouterModule } from '@angular/router';
import { ErrorMessageComponent } from './error-message/error-message.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { InternalErrorComponent } from './internal-error/internal-error.component';

@NgModule({
  imports: [
    CommonModule, RouterModule
  ],
  declarations: [
    NavbarComponent,
    ErrorMessageComponent,
    ErrorMessageComponent,
    NotFoundComponent,
    InternalErrorComponent
  ],
  exports: [
    NavbarComponent, ErrorMessageComponent, CommonModule
  ]
})
export class SharedModule { }
