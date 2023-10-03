import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { GameService } from './game.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})

export class GameComponent {

  constructor(private gameService: GameService) { }

  isGameOn: boolean = false;

  setGame(event: boolean) {
    this.gameService.startGame()
    this.isGameOn = event
  }
}
