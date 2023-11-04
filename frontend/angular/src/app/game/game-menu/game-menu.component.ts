import { Component } from '@angular/core';
import { EventEmitter, Input, Output } from '@angular/core';
import { Socket } from 'ngx-socket-io';  

@Component({
  selector: 'app-game-menu',
  templateUrl: './game-menu.component.html',
  styleUrls: ['./game-menu.component.css']
})
export class GameMenuComponent {

  newGame: boolean = false;

  @Input() statusValue: string;

  @Output() newGameEvent = new EventEmitter<number>;

  newGameEasy(){
    this.newGameEvent.emit(1);
  }
  newGameNormal(){
    this.newGameEvent.emit(2);
  }
  newGameHard(){
    this.newGameEvent.emit(3);
  }
  play(){
    this.newGame = true;
    this.statusValue = "";
  }
}
