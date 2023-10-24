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

  matchLeftSide = true;

  yourScore = 0;
  opponentScore = 0;

  ballCanMove = true;
  paddleCanMove = true;

  ballWidth = 3;
  ballHeight = 3;

  paddleWidth = 1;
  paddleHeight = 20;
  paddleMargin = 3;
  paddleSpeed = 1;
  paddleRightX = 100 - this.paddleMargin - this.paddleWidth + 1.5 ;
  paddleRightY = 40;
  paddleLeftY = 40;
  paddleLeftX = this.paddleMargin;

  ballX = 500;
  ballY = 500;

  ballRadius = 1.5;

  paddleLeftIncrement = 0;
  paddleRightIncrement = 0;

  maxViewHeight = 1000;
  maxViewWidth = 1000;
  maxHeight = 500;
  maxWidth = 1000;

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

  /* Update score, should I change the value of the color of the ball depending on the game choice? */
  updateScore(scores: Record <string, number>) {
    let first = false;
    for (const score in scores){
      this.yourScore = scores[score];
      if(first == true) {
        this.opponentScore = scores[score];
        break;
      }
      first = true;
    }
  }

  /*
    the backend send position related to a window 2:1
    in frontend we use % so we need to translate the values
    that's how we do that:
  */
  valueConversion(game: Game) {
    if( game.ball){
        // game.ball.position.x = (100 / maxWidth) * game.ball.position.x;
        // game.ball.position.y = (100 / maxHeight) * game.ball.position.y;
        // game.ball.velocity.x = (100 / maxWidth) * game.ball.velocity.x;
        // game.ball.velocity.y = (100 / maxWidth) * game.ball.velocity.y;
        if(this.matchLeftSide == true){
          game.ball.position.x = game.ball.position.x/this.maxWidth * this.maxViewWidth;
          game.ball.position.y = game.ball.position.y/this.maxHeight * this.maxViewHeight;
        } else {
          game.ball.position.x = this.maxViewWidth - (game.ball.position.x/this.maxWidth * this.maxViewWidth);
          game.ball.position.y = game.ball.position.y/this.maxHeight * this.maxViewHeight;
        }

        // game.ball.position.x = 0;
    }
    if (game.leftPaddle)
      game.leftPaddle!.position.y  = ( 100/ this.maxHeight) * game.leftPaddle!.position.y;
    if (game.rightPaddle)
    game.rightPaddle!.position.y  = ( 100/ this.maxHeight) * game.rightPaddle!.position.y;
    console.log 
    return game;
  }

  resetAll(): void {
    // this.score0 = 0;
    // this.score1 = 0;
    // this.resetBallAndRackets();
  }

  async moveBall(ball: Ball): Promise<void> {
      this.ballX = ball.position.x;
      this.ballY = ball.position.y;
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
      if( this.gameInfo.scores) {
        const scores = this.gameInfo.scores;
        window.requestAnimationFrame(() => this.updateScore(scores))
      }
    }
  }

  initViewValue(){
    let element = document.getElementById("board") as unknown as SVGRectElement;
    if(element?.height && element?.width){
        this.maxViewHeight = element?.height.baseVal.value;
        this.maxViewWidth = element?.width.baseVal.value;
    }
  }

  isWaitingInQueue(){
    this.gameService.getStatusQueue().subscribe((status: boolean) => {
      if(status == true){
        this.gameService.queueEmit();
      } else {
        this.isInQueue = false;
        this.isGameOn = true;
      }
    })
  }
  

  pause = false;

  gameObservableInit(){
    this.gameService.getTestObservable().subscribe((game: Game) => {
      if(game){
        this.gameInfo = this.valueConversion(game);
        if(this.gameInfo.leftPaddle?.length)
          this.paddleHeight = this.gameInfo.leftPaddle?.length;
      }
      if (this.pause == false){
        this.initViewValue();
        this.matchLeftSide = this.gameService.matchIsLeftSide();
        this.pause = true;
      }
      this.startPlaying();
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
