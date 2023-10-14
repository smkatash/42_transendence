import { AfterViewInit, Component, EventEmitter, HostListener, OnInit, Output, Renderer2 } from '@angular/core';
import { GameService } from './game.service';
import { Ball, Game } from '../entities.interface';
import { GameSocket } from 'src/app/app.module';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})

export class GameComponent implements AfterViewInit {

  constructor(private rend: Renderer2, 
              private gameService: GameService,
              private socket: GameSocket ) 
  {
    this.gameService.getUser();
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

  paddleRightX = 100 - this.paddleMargin - this.paddleWidth + 1.5 ;
  paddleRightY = 40;

  ballX = 0
  ballY = 0

  paddleLeftIncrement = 0;
  paddleRightIncrement = 0;

  game?:Game;

  checkSize() {
    let board = document.querySelector('.game_board');
    // console.log(board!.clientHeight);
    let widthValue = board!.clientWidth;
    let heightValue = widthValue / 2;
    this.rend.setStyle(board, "height", heightValue + "px");
    this.gameService.updateSize(widthValue, heightValue);
  }

  ngAfterViewInit(): void {
    this.checkSize();
  }

  @Output() paddlePositionChange = new EventEmitter<string>();

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: any) {
    if (e.code === 'KeyW') {
      this.gameService.handlePadleEvent("-10")
    }
    if (e.code === 'KeyS') {
      this.gameService.handlePadleEvent("+10")
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(e: any) {
    if (e.code === 'KeyW' || e.code === 'KeyS') {
      this.paddlePositionChange.emit("0");
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(e: any) {
    this.checkSize();
  }
  /* 
    Here we need to be sure that the racket don't pass trough the borders:
    .   The smaller beetween 100% - the value in which the racket is
    .   The bigger beetween 0% + the value in which the racket is
  */
  moveLeftRacket(position: number): void {
    let board = document.querySelector('.game_board');
    let newPosition = position;
    if (newPosition >= board!.clientHeight - this.paddleHeight)
      newPosition = this.paddleLeftY;
    else if ( newPosition <= 0 + this.paddleHeight)
      newPosition = this.paddleLeftY;
    this.paddleLeftY = newPosition;
    // newPosition = position > 100 - this.paddleHeight ? 100 - this.paddleHeight : newPosition;
    // this.paddleLeftY = newPosition < 0 ? 0 : newPosition;
    window.requestAnimationFrame(() => this.moveLeftRacket(this.paddleLeftY));
  }

  /*
    the backend send position related to a window 2:1
    in frontend we use % so we need to translate the values
    that's how we do that:
  */
  valueConversion(game: Game) {
    const maxHeight = this.gameService.height;
    const maxWidth = this.gameService.width;
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
    // if(ball.velocity.x > 0){
    //   if(ball.velocity.y > 0 && (this.ballY + ball.velocity.y) < 100){
    //     if(this.ballX <= ball.position.x){
    //       this.ballX = ball.position.x;
    //     } else { this.ballX = this.ballX + ball.velocity.x; }
    //     if(this.ballY <= ball.position.y){
    //       this.ballY = ball.position.y;
    //     } else { this.ballY = this.ballY + ball.velocity.y }  
    //   } else {
    //     if(this.ballX <= ball.position.x) {
    //       this.ballX = ball.position.x; 
    //     } else { this.ballX = this.ballX + ball.velocity.x; }
    //     if(this.ballY >= ball.position.y) {
    //       this.ballY = ball.position.y;
    //     } else { this.ballY = this.ballY - ball.velocity.y }
    //   }
    // } else {
    //   if(ball.velocity.y > 0 && (this.ballY + ball.velocity.y) < 100){
    //     if(this.ballX >= ball.position.x){
    //       this.ballX = ball.position.x;
    //     } else { this.ballX = this.ballX - ball.velocity.x; }
    //     if(this.ballY <= ball.position.y){
    //       this.ballY = ball.position.y;
    //     } else { this.ballY = this.ballY + ball.velocity.y; }  
    //   } else {
    //     if(this.ballX >= ball.position.x) {
    //       this.ballX = ball.position.x; 
    //     } else { this.ballX = this.ballX - ball.velocity.x; }
    //     if(this.ballY >= ball.position.y) {
    //       this.ballY = ball.position.y;
    //     } else { this.ballY = this.ballY - ball.velocity.y}
    //   }
    // }
    this.ballX = ball.position.x;
    this.ballY = ball.position.y;
    window.requestAnimationFrame(() => this.moveBall(ball));
    // window.requestAnimationFrame(() => this.moveBall(xIncrement, yIncrement));
  }

  startPlaying(){
    this.gameService.getTestObservable().subscribe((test: Game) => {
      this.game = test;
      this.game = this.valueConversion(this.game);
      // this.game.ball.position.y = 0;
      var ball = this.game.ball;
      const positionX = this.game.ball.position.x;
      // const positionY = 0;
      const positionY = this.game.ball.position.y;

      // console.log(positionX)
      // console.log(positionY)
      window.requestAnimationFrame(() => this.moveBall(ball));
      var positionPaddle = this.game.leftPaddle.position.y
      window.requestAnimationFrame(() => this.moveLeftRacket(positionPaddle));
      // window.requestAnimationFrame(() => this.moveRacket1(this.racket1Increment));
      this.resetAll();
    })
    // if(this.game?.status !== 3){
      // this.startPlaying();
    // }
  }

  isGameOn: boolean = false;

  setGame(event: boolean) {
    this.gameService.startGame()
    this.isGameOn = event
    this.startPlaying();
  }
}
