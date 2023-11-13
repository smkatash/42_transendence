import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { Player } from '../entities.interface';
import { LeaderboardService } from './leaderboard.service';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})

export class LeaderboardComponent implements OnInit {
	players: Player[] = []
	constructor(
		private leaderboardService: LeaderboardService
		) {}


	ngOnInit() {
		this.getPlayersStats();
	  }
	
	  getPlayersStats() {
		this.leaderboardService.getAllPlayersStats().subscribe(
			(data) => {
				if (data) {
					this.players = data;
				}
			},
			(error) => {
				console.error('Error fetching player stats', error);
			}
		)}
}
