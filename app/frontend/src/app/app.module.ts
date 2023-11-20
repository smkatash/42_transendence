import { Injectable, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'
import { Socket } from 'ngx-socket-io';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/auth.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MfaComponent } from './auth/mfa/mfa.component';
import { FormsModule } from '@angular/forms';
import { HOST_IP } from './Constants';
import { Subject } from 'rxjs';


@Injectable()
export class UserSocket extends Socket {
  constructor() {
    super({ url: `${HOST_IP}/api/profile`, options: { withCredentials: true } })
  }
}

@Injectable()
export class GameSocket extends Socket {
  private connectionSubject: Subject<boolean> = new Subject<boolean>();
  public connection$ = this.connectionSubject.asObservable();

  constructor() {
    super({ url: `${HOST_IP}/game`, options: { withCredentials: true } });

    this.ioSocket.on('connect', () => {
      console.log(" INJECTABLE GOT CONNECTION")
      this.connectionSubject.next(true);
    });

    this.ioSocket.on('disconnect', () => {
      console.log(" INJECTABLE GOT DISCONNECTION")
      this.connectionSubject.next(false);
    });
  }
  connection(): void {
    this.ioSocket.connect();
    this.connectionSubject.next(true);
  }

  disconnection(): void {
    this.ioSocket.disconnect();
    this.connectionSubject.next(false);
  }
}

@Injectable()
export class ChatSocket extends Socket {
  constructor() {
    super({ url: `${HOST_IP}/api/chat`, options: { withCredentials: true } })
  }
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MfaComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [GameSocket, ChatSocket, UserSocket],
  bootstrap: [AppComponent]
})
export class AppModule { }
