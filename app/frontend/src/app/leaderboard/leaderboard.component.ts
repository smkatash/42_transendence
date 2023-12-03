import { Component, OnInit } from '@angular/core';
import { Player } from '../entities.interface';
import { LeaderboardService } from './leaderboard.service';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})

export class LeaderboardComponent implements OnInit {

  players: Player[] = []
  constructor(private leaderboardService: LeaderboardService) {}

  quote = ''

  ngOnInit() {
    this.leaderboardService.getAllPlayersStats()
      .subscribe({
        next: players => this.players = players,
        error: error => console.error('Error fetching player stats', error)
      })
    this.quote = this.generateRandomQuote()
  }

  generateRandomQuote(){
    const arrayOfQuotes = [ "'In war, the moral is to the physical as three is to one.' - N. Bonaparte",
                            "'In war, the way is to avoid what is strong and to strike at what is weak.' - S. Tzu",
                            "'Don't touch my Mock-Up, I spent hours on it' - Jad",
                            "'I don't care, I did 70% of this. I deserve vacation' - Kany",
                            "'Where is my front wheel?' - Arvydas",
                            "'The supreme art of war is to subdue the enemy without fighting.' - S. Tzu.",
                            "'I came, I saw, I conquered.' - J. Caesar, Roman military and political leader.",
                            "'Do or do not, there is no try.' - K. Tashbaeva",
                            "'I find your overwhelming optimism disturbing.' - A. Jazbutis",
                            "'You want to go home and rethink your life.' - J. Maalouf",
                            "'I don't care I remove EVERYTHING. I push, I go to Lithuania, you do it.' - Francesco Paolo Messina"];
    const randomInteger = Math.random() * 10;
    var random = arrayOfQuotes[Math.floor(randomInteger)];
    return random;
  };

}
