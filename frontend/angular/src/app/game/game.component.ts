import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, OnInit, Output, Renderer2, RendererFactory2 } from '@angular/core';
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
              private rendererFactory: RendererFactory2,
              private elementReference: ElementRef, 
              private gameService: GameService,
              private socket: GameSocket ) 
  {
    this.gameService.getUser();
    this.renderer = rendererFactory.createRenderer(null, null);

  }

  matchLeftSide = true;

  yourScore = 0;
  opponentScore = 0;
  
  maxViewHeight = 546;
  maxViewWidth = 1092;

  // TODO THIS VALUE SHOULD GO INTO THE ENV
  maxHeight = 500;
  maxWidth = 1000;

  ballCanMove = true;
  paddleCanMove = true;

  ballWidth = 3;
  ballHeight = 3;

  paddleWidth = 1;
  paddleHeight = 20;
  paddleMargin = 3;
  paddleSpeed = 1;
  paddleRightX = this.maxViewWidth - 40;
  paddleRightY = 40;
  paddleLeftY = 40;
  paddleLeftX = 40;

  ballX = 500;
  ballY = 250;

  ballRadius = 1.5;

  paddleLeftIncrement = 0;
  paddleRightIncrement = 0;



  gameInfo?:Game = {};

  private boardElement: HTMLElement;

  checkBoardSize() {
    if (this.isGameOn) {
      this.boardElement = this.elementReference.nativeElement.querySelector('.table');
      this.maxViewWidth = this.boardElement.clientWidth;
      this.maxViewHeight = this.boardElement.clientHeight;

      console.log('Board width in pixels: ' + this.maxViewWidth);
      console.log('Board height in pixels: ' + this.maxViewHeight);
    }
    // let board = document.querySelector('.game_board');
    // let widthValue = board!.clientWidth;
    // let heightValue = widthValue / 2;
    // this.renderer.setStyle(board, "height", heightValue + "px");
    // this.renderer.setStyle(board, "background-color", "black");
    // this.gameService.updateSize(widthValue, heightValue);
  }

  ngAfterViewInit(): void {
    this.checkBoardSize();
  }


  @Output() paddlePositionChange = new EventEmitter<string>();

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: any) {
    if (e.code === 'KeyW') {
      this.gameService.padlePositionEmitter("-40")
      console.log("movedPaddleUp")
    }
    if (e.code === 'KeyS') {
      console.log("movedPaddleDown")
      this.gameService.padlePositionEmitter("+40")
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
    this.checkBoardSize();
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
    let id = this.gameService.userInfo.id;
    this.yourScore = scores[id];
    for (const score in scores){
      if (id != score){
        this.opponentScore = scores[score];
      }
    }
  }

  /*
    the backend send position related to a window 2:1
    in frontend we use % so we need to translate the values
    that's how we do that:
  */
  valueConversion(game: Game) {
    this.checkBoardSize();
    if( game.ball){
      if(this.matchLeftSide == true){
        game.ball.position.x = (this.maxViewWidth / this.maxWidth) * game.ball.position.x;  // | - p     |
        game.ball.position.y = (this.maxViewHeight /this.maxHeight) * game.ball.position.y;
      } else {
        game.ball.position.x = this.maxViewWidth -  (this.maxViewWidth / this.maxWidth) * game.ball.position.x; // |      p - |
        game.ball.position.y = (this.maxViewHeight / this.maxHeight) * game.ball.position.y;
      }
    }
    if (game.leftPaddle){
      game.leftPaddle!.position.x = ( this.maxViewWidth / this.maxWidth ) * game.leftPaddle!.position.x;
      game.leftPaddle!.position.y = ( this.maxViewHeight / this.maxHeight ) * game.leftPaddle!.position.y;
    }
    if (game.rightPaddle){
      game.rightPaddle!.position.x = ( this.maxViewWidth / this.maxWidth ) * game.rightPaddle!.position.x;
      game.rightPaddle!.position.y = ( this.maxViewHeight / this.maxHeight ) * game.rightPaddle!.position.y
    }
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

  /* 
    since the values comes from backend this function move the 
    rightPaddle or the leftPaddle depending if the game is Leftside or not
    if yes: then this move the Right Paddle;
    if not: it moves the left;
  */
  moveRightPaddle(rightPaddle: Paddle){
    if(this.matchLeftSide === true){
      this.paddleRightY = rightPaddle!.position.y;
      this.paddleRightX = rightPaddle!.position.x
    } else {
      this.paddleLeftY = rightPaddle!.position.y;
      this.paddleRightX = rightPaddle!. position.x;
    }
  }

  /* 
    same as the one upstairs
  */
  moveLeftPaddle(leftPaddle: Paddle){
    if(this.matchLeftSide === true) {
      this.paddleLeftY = leftPaddle!.position.y;
      this.paddleLeftX = leftPaddle!.position.x;
    } else {
      this.paddleRightY = leftPaddle!.position.y;
      this.paddleLeftX = leftPaddle!.position.x;
    }
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

  // ------------------------------------------------------------------------------------------------ INIT VALUE 

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
        if(this.gameInfo.leftPaddle?.length){
          this.paddleHeight = ( 100/ this.maxHeight) * this.gameInfo.leftPaddle?.length;
        }
      }
      if (this.pause == false){
        // this.initViewValue();
        this.pause = true;
      }
      this.matchLeftSide = this.gameService.matchIsLeftSide()
      this.startPlaying();
    })
  }

  isInQueue: boolean = false;
  isGameOn: boolean = false;

  ngOnInit() {
    this.initViewValue()
  };


  setGame(event: number) {
    this.isInQueue = true;
    this.gameObservableInit();
    this.gameService.startGameService(event);
    this.isWaitingInQueue();
  }
}
