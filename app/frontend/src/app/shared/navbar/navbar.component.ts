import { Component } from '@angular/core';
import { UserSocket } from 'src/app/app.module';
import { AudioService } from 'src/app/audio.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  constructor(private userSocket: UserSocket,
              private audioService: AudioService) {}

  click() {
    this.audioService.playClick()
  }

}
