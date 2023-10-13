import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { GameService } from './game.service';
import { Ball, Game } from '../entities.interface';
import { GameSocket } from 'src/app/app.module';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})

export class GameComponent /* implements OnInit */ {

  constructor(private gameService: GameService, private socket: GameSocket ) 
  {
    this.gameService.getUser()
    this.gameService.keyPress.subscribe((key: string) => {
    this.handleKeyPress(key); });
  }

  yourScore = 0;
  opponentScore = 0;
  ballCanMove = true;
  paddleCanMove = true;

  ballWidth = 3;
  ballHeight = 3;

  paddleWidth = 3;
  paddleHeight = 20;

  paddleMargin = 3;
  paddleSpeed = 1;

  paddleLeftY = 40;
  paddleLeftX = this.paddleMargin;

  paddleRightX = 100 - this.paddleMargin - this.paddleWidth/2;
  paddleRightY = 40;

  ballX = 0
  ballY = 0

  paddleLeftIncrement = 0;
  paddleRightIncrement = 0;

  game?:Game;


  handleKeyPress(key: string) {
    // Handle key press events in the parent component.
    if (key === 'w') {
      console.log("DIOCANE")
    } else if (key === 's') {
      // Do something when 's' is pressed.
    }
  }

  @Output() paddlePositionChange = new EventEmitter<string>();

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: any) {
    if (e.code === 'KeyW') {
      this.moveLeftRacket(this.paddleLeftY - ( 100 / 500) * 1)
      this.paddlePositionChange.emit("-1");
    }
    if (e.code === 'KeyS') {
      this.moveLeftRacket(this.paddleLeftY + ( 100 / 500) * 1)
      this.paddlePositionChange.emit("+1");
    }
  }

  /* 
    Here we need to be sure that the racket don't pass trough the borders:
    .   The smaller beetween 100% - the value in which the racket is
    .   The bigger beetween 0% + the value in which the racket is
  */
  moveLeftRacket(position: number): void {
    let newPosition = position;
    const maxvalue = 100 - this.paddleHeight;
    const minvalue = 0;
    newPosition = Math.min(newPosition, maxvalue);
    newPosition = Math.max(newPosition, minvalue);
    this.paddleLeftY = newPosition;
  }

  /*
    the backend send position related to a window 2:1
    in frontend we use % so we need to translate the values
    that's how we do that:
  */
  valueConversion(game: Game) {
    const maxHeight = 500;
    const maxWidth = 1000;
    game.ball.position.x = (100 / maxWidth) * game.ball.position.x;
    game.ball.position.y = ( 100/ maxHeight ) * game.ball.position.y;
    game.leftPaddle.position.y  = ( 100/ maxHeight) * game.leftPaddle.position.y;
    game.rightPaddle.position.y  = ( 100/ maxHeight) * game.rightPaddle.position.y;
    game.ball.velocity.x = (100 / maxWidth) * game.ball.velocity.x;
    game.ball.velocity.y = (100 / maxWidth) * game.ball.velocity.y;
    return game;
  }

  resetAll(): void {
    // this.score0 = 0;
    // this.score1 = 0;
    // this.resetBallAndRackets();
  }

  async moveBall(ball: Ball): Promise<void> {
    if(ball.velocity.x > 0){
      if(ball.velocity.y > 0 && (this.ballY + ball.velocity.y) < 100){
        if(this.ballX <= ball.position.x){
          this.ballX = ball.position.x;
        } else { this.ballX = this.ballX + ball.velocity.x; }
        if(this.ballY <= ball.position.y){
          this.ballY = ball.position.y;
        } else { this.ballY = this.ballY + ball.velocity.y }  
      } else {
        if(this.ballX <= ball.position.x) {
          this.ballX = ball.position.x; 
        } else { this.ballX = this.ballX + ball.velocity.x; }
        if(this.ballY >= ball.position.y) {
          this.ballY = ball.position.y;
        } else { this.ballY = this.ballY - ball.velocity.y }
      }
    } else {
      if(ball.velocity.y > 0 && (this.ballY + ball.velocity.y) < 100){
        if(this.ballX >= ball.position.x){
          this.ballX = ball.position.x;
        } else { this.ballX = this.ballX - ball.velocity.x; }
        if(this.ballY <= ball.position.y){
          this.ballY = ball.position.y;
        } else { this.ballY = this.ballY + ball.velocity.y; }  
      } else {
        if(this.ballX >= ball.position.x) {
          this.ballX = ball.position.x; 
        } else { this.ballX = this.ballX - ball.velocity.x; }
        if(this.ballY >= ball.position.y) {
          this.ballY = ball.position.y;
        } else { this.ballY = this.ballY - ball.velocity.y}
      }
    }
    // this.ballX = ball.position.x;
    // this.ballY = ball.position.y;
    // window.requestAnimationFrame(() => this.moveBall(xIncrement, yIncrement));
  }

  startPlaying(){
    this.gameService.getTestObservable().subscribe((test: Game) => {
      this.game = test;
      this.game = this.valueConversion(this.game);
      var ball = this.game.ball;
      const positionX = this.game.ball.position.x;
      const positionY = this.game.ball.position.y;
      console.log(" MA CRISTO IDDIO");
      window.requestAnimationFrame(() => this.moveBall(ball));
      console.log(this.game.leftPaddle.position.y);
      var positionPaddle = this.game.leftPaddle.position.y
      window.requestAnimationFrame(() => this.moveLeftRacket(positionPaddle));
      // window.requestAnimationFrame(() => this.moveRacket1(this.racket1Increment));
      this.resetAll();
    })
    if(this.game?.status !== 3){
      this.startPlaying();
    }
  }

  isGameOn: boolean = false;

  setGame(event: boolean) {
    this.gameService.startGame()
    this.isGameOn = event
    this.startPlaying();
  }
}
