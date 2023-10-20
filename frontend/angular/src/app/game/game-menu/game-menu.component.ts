import { Component } from '@angular/core';
import { EventEmitter, Input, Output } from '@angular/core';
import { Socket } from 'ngx-socket-io';  

@Component({
  selector: 'app-game-menu',
  templateUrl: './game-menu.component.html',
  styleUrls: ['./game-menu.component.css']
})
export class GameMenuComponent {

  @Output() newGameEvent = new EventEmitter<number>;
  newGame() {
    this.newGameEvent.emit(0);
  }
  newGameEasy(){
    this.newGameEvent.emit(0);
  }
  newGameNormal(){
    this.newGameEvent.emit(1);
  }
  newGameHard(){
    this.newGameEvent.emit(2);
  }
}
