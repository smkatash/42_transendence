import { Component } from '@angular/core';
import { GameSocket } from './app.module';
import { NavigationEnd, Router } from '@angular/router';
import { filter, pipe } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Le Pong';
  constructor(private router: Router, private socket: GameSocket) {}
  ngOnInit(): void {
    this.router.events
      .subscribe((e) => {
        if (e instanceof NavigationEnd) {
          console.log(e.url)
          if (e.url.includes('game')) {
            this.socket.emit('router', 'game')
          } else if (e.url.includes('leaderboard')) {
            this.socket.emit('router', 'leaderboard')
          } else if (e.url.includes('profile')) {
            this.socket.emit('router', 'profile')
          } else if (e.url.includes('chat')) {
            this.socket.emit('router', 'chat')
          }
        }
      })
  }
}
