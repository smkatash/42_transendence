import { Component } from '@angular/core';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { Player } from '../entities.interface';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent {
  players?: Player[] = [
    { id: 1, clientId: 'random', score: 10, gameState: 12 },
    { id: 2, clientId: 'random', score: 10, gameState: 12 },
  ]
}
