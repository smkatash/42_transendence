import { Injectable, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'
import { Socket } from 'ngx-socket-io';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/auth.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Injectable()
export class GameSocket extends Socket {
  constructor() {
    super({ url: 'http://127.0.0.1:3000/game', options: { withCredentials: true } })
  }
}

@Injectable()
export class ChatSocket extends Socket {
  constructor() {
    super({ url: 'http://127.0.0.1:3000/chat', options: { withCredentials: true } })
  }
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    ],
  providers: [GameSocket, ChatSocket],
  bootstrap: [AppComponent]
})
export class AppModule { }
