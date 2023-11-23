import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, OnInit, Output, Renderer2, RendererFactory2 } from '@angular/core';
import { GameService } from './game.service';
import { Ball, Game, Paddle, GameState } from '../entities.interface';
// import { NONE_TYPE } from '@angular/compiler';
import { ActivatedRoute, Route } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})

export class GameComponent implements AfterViewInit, OnInit {

  constructor(private renderer: Renderer2,
              private rendererFactory: RendererFactory2,
              private elementReference: ElementRef,
              private gameService: GameService,
              private route: ActivatedRoute)
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

  status: number;
  statusStr = "";

  gameInfo?:Game = {};

  private boardElement: HTMLElement;

  checkBoardSize() {
    if (this.isGameOn) {
      this.boardElement = this.elementReference.nativeElement.querySelector('.table');
      this.maxViewWidth = this.boardElement.clientWidth;
      this.maxViewHeight = this.boardElement.clientHeight;
    }
  }

  ngAfterViewInit(): void {
    this.checkBoardSize();
  }


  @Output() paddlePositionChange = new EventEmitter<string>();

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: any) {
    if (e.code === 'KeyW') {
      this.gameService.emitPaddlePosition("-10")
    }
    if (e.code === 'KeyS') {
      this.gameService.emitPaddlePosition("+10")
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
    Update score,
    should I change the value of the color of
    the ball depending on the game choice?
  */
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
      if(this.matchLeftSide === true){
        game.ball.position.x = (this.maxViewWidth / this.maxWidth) * game.ball.position.x;
        game.ball.position.y = (this.maxViewHeight /this.maxHeight) * game.ball.position.y;
      } else {
        game.ball.position.x = this.maxViewWidth -  (this.maxViewWidth / this.maxWidth) * game.ball.position.x;
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
      if(this.gameInfo.leftPaddle && this.gameInfo.rightPaddle){
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
        console.log("HEIGHT:" + element.height + " WIDTH: " + element.width)
        this.maxViewHeight = element?.height.baseVal.value;
        this.maxViewWidth = element?.width.baseVal.value;
    }
  }

  isWaitingInQueue(){
    this.gameService.getStatusQueue().subscribe((status: boolean) => {
      if(status === true){
        ;
      } else {
        this.isInQueue = false;
        this.invited = false;
        this.isGameOn = true;
      }
    })
  }

  settledSide : boolean;

  isInQueue: boolean = false;
  isGameOn: boolean = false;

  /* Router params for game invite */
  invited: boolean = false
  accepted: boolean = false

  observableAreOn = false;

  gameQueue: boolean = false;

  handlerQueueInfo( status: boolean) {
    if(status === true){
      this.gameQueue = true;
    } else {
      this.gameQueue = false;
      this.isGameOn = true;
      this.initViewValue()
    }
  }

  handlerGameInfo (game: any) {
    if( game && game.gameStatus !== GameState.END){
      if(this.settledSide === false){
        if(game.match?.players[0].id  ===  this.gameService.userInfo.id){
          this.matchLeftSide = true;
        } else {
          this.matchLeftSide = false;
        }
        this.settledSide = true;
      }
      console.log("BEFORE CONVERSION")
      console.log(JSON.stringify(game));
      this.gameInfo = this.valueConversion(game);
      // console.log( "USER ID Player [0]: " + this.gameInfo.match?.players[0].id +
      //                "\nUSER ID Player [1]: " + this.gameInfo.match?.players[1].id +
      //                "\nMY ID: " + this.gameService.userInfo.id +
      //                "\nball: " + this.gameInfo.ball?.position.x + " " + this.gameInfo.ball?.position.y +
      //                "\nmatch score: " + this.gameInfo.match?.currentUserScore + " id: "
      //                            +  this.gameInfo.match?.id + " loser: "
      //                            +  this.gameInfo.match?.loser + " matchResult: "
      //                            +  this.gameInfo.match?.matchResult + " opponentUser: "
      //                            +  this.gameInfo.match?.opponentUser + " oppoentScore: "
      //                            +  this.gameInfo.match?.opponentUserScore + " status: "
      //                            +  this.gameInfo.match?.status + " winner: "
      //                            +  this.gameInfo.match?.winner );
      if(this.gameInfo.leftPaddle?.length){
        this.paddleHeight = ( 100/ this.maxHeight) * this.gameInfo.leftPaddle?.length;
      }
    }
    this.startPlaying();
  }

  handlerStatusInfo(data:any){
    this.status = data;
      if (this.status === GameState.READY)
        this.readyFunc();
      else if (this.status === GameState.START)
        this.startFunc();
      else if (this.status === GameState.INPROGRESS)
        this.progressFunc();
      else if (this.status === GameState.PAUSE)
        this.pauseFunc();
      else if (this.status === GameState.END)
        this.endFunc();
  }

  handlerInvite(){
    this.settledSide = false;
    this.gameQueue = true;
    this.isWaitingInQueue();
  }

  handlerAccept() {
    this.gameQueue = false;
    this.settledSide = false;
    this.isGameOn = true;
  }
  private sub: Subscription | undefined;
  private subOne: Subscription | undefined;
  private subTwo: Subscription | undefined;
  private subThree: Subscription | undefined;

  public gameObservableOn = false;
  gameObservableInit() {
    if (!this.gameObservableOn) {
      this.gameObservableOn = true;

      this.sub = this.gameService.getGameObservable().subscribe((game: Game) => {
        console.log("Received game update from observable:");
        console.log(JSON.stringify(game));

        this.handlerGameInfo(game);
      });

      this.subOne = this.gameService.getGameStatus().subscribe(data => {
        console.log("Received game status update:");
        console.log(JSON.stringify(data));

        this.handlerStatusInfo(data);
      });

      this.subTwo = this.gameService.getStatusQueue().subscribe((status: boolean) => {
        console.log("Received queue status update:");
        console.log(JSON.stringify(status));

        this.handlerQueueInfo(status);
      });
    }
  }


  ngOnInit() {
    this.gameService.handleConnection();
    console.log("SUBSCRIBE TO OBSERVABLE")
    this.gameObservableInit();
    this.invited = ('true' === this.route.snapshot.paramMap.get('invite'))
    this.accepted = ('true' === this.route.snapshot.paramMap.get('accept'))
    if( this.invited === true) { this.handlerInvite() }
    if( this.accepted === true) { this.handlerAccept() }
  }

  readyFunc() {
    console.log("READY")
  }
  startFunc(){
  }
  progressFunc(){
  }
  pauseFunc(){
    this.settledSide = false;
    this.invited = false;
    this.accepted = false;
    this.gameQueue = false;
    this.isGameOn = false;
    this.winnerPrompt();
  }
  endFunc(){
    console.log("END")
    this.settledSide = false;
    this.invited = false;
    this.accepted = false;
    this.gameQueue = false;
    this.isGameOn = false;
    this.winnerPrompt();
  }

  winnerPrompt(){
    if(this.gameInfo?.match?.winner.id === this.gameService.userInfo.id){
      this.statusStr = "WIN";
    } else {
      this.statusStr = "LOS";
    }
  }

  resetAll(): void {
    ;
  }


  ngOnDestroy() {
    console.log("UNSUBSCRIBE OBSERVABLE");
    if (this.sub) {
      this.sub.unsubscribe()
      this.subOne?.unsubscribe()
      this.subTwo?.unsubscribe()
    }
    this.gameService.handleDisconnection();
    this.isGameOn = false;
  }

  setGame(event: number) {
    this.settledSide = false;
    console.log("going to start emit");
    this.gameService.startGameService(event);
    this.gameQueue = true;
    this.isWaitingInQueue();
  }
}
