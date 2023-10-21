import { AfterViewInit, Component, EventEmitter, HostListener, OnInit, Output, Renderer2 } from '@angular/core';
import { GameService } from './game.service';
import { Ball, Game, Paddle } from '../entities.interface';
import { GameSocket } from 'src/app/app.module';
import { NONE_TYPE } from '@angular/compiler';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})

export class GameComponent implements AfterViewInit {

  constructor(private renderer: Renderer2, 
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

  ballX = 50;
  ballY = 50;
  ballRadius = 1.5;

  paddleLeftIncrement = 0;
  paddleRightIncrement = 0;

  gameInfo?:Game = {};

  checkSize() {
    let board = document.querySelector('.game_board');
    let widthValue = board!.clientWidth;
    let heightValue = widthValue / 2;
    this.renderer.setStyle(board, "height", heightValue + "px");
    this.renderer.setStyle(board, "background-color", "black");
    this.gameService.updateSize(widthValue, heightValue);
  }

  ngAfterViewInit(): void {
    this.checkSize();
  }

  @Output() paddlePositionChange = new EventEmitter<string>();

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: any) {
    if (e.code === 'KeyW') {
      this.gameService.padlePositionEmitter("-10")
      console.log("movedPaddleUp")
    }
    if (e.code === 'KeyS') {
      console.log("movedPaddleDown")
      this.gameService.padlePositionEmitter("+10")
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
    // window.requestAnimationFrame(() => this.moveLeftRacket(this.paddleLeftY));
  }

  /*
    the backend send position related to a window 2:1
    in frontend we use % so we need to translate the values
    that's how we do that:
  */
  valueConversion(game: Game) {
    const maxHeight = this.gameService.height;
    const maxWidth = this.gameService.width;
    if( game.ball ){
      game.ball!.position.x = (100 / maxWidth) * game.ball!.position.x;
      game.ball!.position.y = ( 100/ maxHeight ) * game.ball!.position.y;
      game.ball!.velocity.x = (100 / maxWidth) * game.ball!.velocity.x;
      game.ball!.velocity.y = (100 / maxWidth) * game.ball!.velocity.y;
    }
    if (game.leftPaddle)
      game.leftPaddle!.position.y  = ( 100/ maxHeight) * game.leftPaddle!.position.y;
    if (game.rightPaddle)
    game.rightPaddle!.position.y  = ( 100/ maxHeight) * game.rightPaddle!.position.y;
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
      // this.gameInfo = this.valueConversion(this.gameInfo);
      this.ballX = ball.position.x;
      this.ballY = ball.position.y;
      // window.requestAnimationFrame(() => this.moveBall(ball));
    // window.requestAnimationFrame(() => this.moveBall(xIncrement, yIncrement));
  }

  moveRightPaddle(rightPaddle: Paddle){
    this.paddleRightY = rightPaddle!.position.y;
    // window.requestAnimationFrame(() => this.moveRightPaddle(this.gameInfo!.rightPaddle!));
  }
  moveLeftPaddle(leftPaddle: Paddle){
    this.paddleLeftY = leftPaddle!.position.y;
    // window.requestAnimationFrame(() => this.moveRightPaddle(this.gameInfo!.rightPaddle!));
  }

  startPlaying(){
    if(this.gameInfo){
      if( this.gameInfo.ball ) {
        const ball = this.gameInfo.ball
        window.requestAnimationFrame(() => this.moveBall(ball));
      }
      if(this.gameInfo.leftPaddle){
        const paddle = this.gameInfo.leftPaddle
        window.requestAnimationFrame(() => this.moveLeftPaddle(paddle));
      }
      if(this.gameInfo.rightPaddle){
        const paddle = this.gameInfo.rightPaddle
        window.requestAnimationFrame(() => this.moveRightPaddle(paddle));
      }
    }
  }

  isWaitingInQueue(){
    this.gameService.getStatusQueue().subscribe((status: boolean) => {
      if(status == true){
        this.socket.emit('start');
        // console.log("AM I EMITTING? TWICE AT LEAST?")
      } else {
        this.isInQueue = false;
        this.isGameOn = true;
        this.startPlaying();
      }
    })
  }

  gameObservableInit(){
    this.gameService.getTestObservable().subscribe((game: Game) => {
      if(game){
        this.gameInfo = this.valueConversion(game);
      }
      this.startPlaying();
      // console.log(game)
    })
  }

  isInQueue: boolean = false;
  isGameOn: boolean = false;

  setGame(event: number) {
    this.isInQueue = true;
    this.gameObservableInit();
    this.gameService.startGameService(event);
    this.isWaitingInQueue();
  }
}
