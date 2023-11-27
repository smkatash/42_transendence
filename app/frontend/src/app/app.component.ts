import { Component } from '@angular/core';
import { UserSocket } from './app.module';
import { NavigationEnd, Router } from '@angular/router';
import { AudioService } from './audio.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Le Pong';

  constructor(private router: Router,
              private socket: UserSocket,
              private audioService: AudioService) {}

  ngOnInit(): void {
    this.router.events
      .subscribe((e) => {
        if (e instanceof NavigationEnd) {
          if (e.url.includes('game')) {
            this.socket.emit('router', {route: 'game'})
          } else if (e.url.includes('leaderboard')) {
            this.socket.emit('router', {route: 'leaderboard'})
          } else if (e.url.includes('profile')) {
            this.socket.emit('router', {route: 'profile'})
          } else if (e.url.includes('chat')) {
            this.socket.emit('router', {route: 'chat'})
          }
        }
      })
    this.audioService.playBackgroundMusic()
  }
}
