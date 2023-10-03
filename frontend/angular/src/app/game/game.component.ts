import { Component, OnInit } from '@angular/core';
import { GameService } from './game.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})

export class GameComponent /* implements OnInit */ {

  constructor(private gameService: GameService) {
    this.gameService.getUser()
   }

  // ngOnInit(): void {
  // }

  isGameOn: boolean = false;

  setGame(event: boolean) {
    this.gameService.startGame()
    this.isGameOn = event
  }
}
