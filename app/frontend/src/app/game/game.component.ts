import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, OnInit, Output, Renderer2, RendererFactory2 } from '@angular/core';
import { GameService } from './game.service';
import { Ball, Game, Paddle, GameState, GameMode } from '../entities.interface';
// import { NONE_TYPE } from '@angular/compiler';
import { ActivatedRoute, Route, Router } from '@angular/router';
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
              private route: ActivatedRoute,
			  private router: Router
			  )
  {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

// -------------------------------------------------------------------------------
//                                    * variable *
// -------------------------------------------------------------------------------

  ballCanMove         : boolean = true;
  paddleCanMove       : boolean = true;
  ballWidth           : number= 3;
  ballHeight          : number = 3;
  paddleWidth         : number = 1;
  paddleMargin        : number= 3;
  ballRadius          : number = 1.5;
  paddleLeftIncrement : number = 0;
  paddleRightIncrement: number = 0;
  scoreSum            : number = 0;
  yourScore           : number = 0;
  opponentScore       : number = 0;
  maxViewHeight       : number = 546;
  maxViewWidth        : number = 1092;
  maxHeight           : number = 500;
  maxWidth            : number = 1000;
  paddleHeight        : number = 20;
  paddleSpeed         : number = 15;
  paddleRightX        : number = this.maxViewWidth - 40;
  paddleRightY        : number = 40;
  paddleLeftY         : number =40;
  paddleLeftX         : number = 40;
  ballX               : number = 500;
  ballY               : number = 250;
  status              : number;
  statusStr           : string = "";
  gameInfo?           : Game = {};
  settledSide         : boolean = false;
  isGameOn            : boolean = false;
  gameQueue           : boolean = false;
  invited             : boolean = false;
  accepted            : boolean = false;
  invitedUser         : string | null;
  difficultyLevel     : string | null;
  matchLeftSide       : boolean = true;
  velocitySettledUp   : boolean = false;
  previousBallInfo    : Ball;

  private boardElement: HTMLElement;

  ngAfterViewInit(): void {
    this.checkBoardSize();
  }

  @Output() paddlePositionChange = new EventEmitter<string>();

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: any) {
    if (e.code === 'KeyW') {
      this.gameService.emitPaddlePosition("-" + this.paddleSpeed);
      const smooth = ( this.maxViewWidth / this.maxWidth ) * this.paddleSpeed;
    }
    if (e.code === 'KeyS') {
      this.gameService.emitPaddlePosition("+" + this.paddleSpeed);
      const smooth = ( this.maxViewWidth / this.maxWidth ) * this.paddleSpeed;
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

  updateScore(scores: Record <string, number>) {
    let id = this.gameService.userInfo.id;
    this.yourScore = scores[id];
    for (const score in scores){
      if (id != score){
        this.opponentScore = scores[score];
      }
    }
  }

  checkBoardSize() {
    if (this.isGameOn) {
      this.boardElement = this.elementReference.nativeElement.querySelector('.table');
      this.maxViewWidth = this.boardElement.clientWidth;
      this.maxViewHeight = this.boardElement.clientHeight;
    }
  }

  emitSound(text: string){
    if (text == "sdonk"){
      console.log(text);
    }
    if ( text == "applause"){
      console.log(text);
    }
  }

  velocityCheck(game: Game){
    if (this.velocitySettledUp == false && game.ball){
      this.previousBallInfo = game.ball;
      this.velocitySettledUp = true;
      return;
    }
    if( this.previousBallInfo.velocity.x != 0){
      if( game.ball && this.previousBallInfo.velocity.x * game.ball?.velocity.x < 0){
        this.emitSound("sdonk");
      }
    } 
    else if( this.previousBallInfo.velocity.y != 0){
      if( game.ball && this.previousBallInfo.velocity.y * game.ball?.velocity.y < 0){
        this.emitSound("sdonk");
      }
    }
  }

  valueConversion(game: Game) {
    this.checkBoardSize();
    this.velocityCheck(game);
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

  moveRightPaddle(rightPaddle: Paddle){
    if(this.matchLeftSide === true){
      this.paddleRightY = rightPaddle!.position.y;
      this.paddleRightX = rightPaddle!.position.x
    } else {
      this.paddleLeftY = rightPaddle!.position.y;
      this.paddleRightX = rightPaddle!. position.x;
    }
  }

  moveLeftPaddle(leftPaddle: Paddle){
    if(this.matchLeftSide === true) {
      this.paddleLeftY = leftPaddle!.position.y;
      this.paddleLeftX = leftPaddle!.position.x;
    } else {
      this.paddleRightY = leftPaddle!.position.y;
      this.paddleLeftX = leftPaddle!.position.x;
    }
  }

  checkScoreSum(scores: Record <string, number>){
    let sum: number = 0;
    for (const value of Object.values(scores)) {
      sum += value;
    }
    if( sum !== this.scoreSum){
      this.scoreSum = sum;
      this.emitSound("applause");
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
        this.checkScoreSum(scores)
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
      this.gameInfo = this.valueConversion(game);
      if(this.gameInfo.leftPaddle?.length){
        this.paddleHeight = ( 100/ this.maxHeight) * this.gameInfo.leftPaddle?.length;
      }
    }
    this.startPlaying();
  }

  handlerStatusInfo(data:any){
    this.status = data;
      if (this.status === GameState.PAUSE)
        this.pauseFunc();
      else if (this.status === GameState.END)
        this.endFunc();
  }

  private sub: Subscription | undefined;
  private subOne: Subscription | undefined;
  private subTwo: Subscription | undefined;

  public gameObservableOn = false;

  gameObservableInit() {
    if (!this.gameObservableOn) {
      this.gameObservableOn = true;
      this.sub = this.gameService.getGameInfoObservable().subscribe((game: Game) => {
        this.handlerGameInfo(game);
      });
      this.subOne = this.gameService.getGameStatusObservable().subscribe(data => {
        this.handlerStatusInfo(data);
      });
      this.subTwo = this.gameService.getGameQueueObservable().subscribe((status: boolean) => {
        this.handlerQueueInfo(status);
      });
    }
  }

  pauseFunc(){
    this.endFunc();
  }

  endFunc(){
	if(this.accepted || this.invited){
		this.router.navigate(['/game']);
	}
	this.winnerPrompt();
    this.settledSide = false;
    this.invited = false;
    this.accepted = false;
    this.gameQueue = false;
    this.isGameOn = false;
  }

  winnerPrompt(){
    if(this.gameInfo?.match?.winner.id === this.gameService.userInfo.id){
      this.statusStr = "WIN";
    } else {
      this.statusStr = "LOS";
    }
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe()
      this.subOne?.unsubscribe()
      this.subTwo?.unsubscribe()
    }
    this.gameService.handleDisconnection();
  }

  handlerInvite(){
    this.gameQueue = true;
    this.invitedUser = this.route.snapshot.queryParamMap.get('userId');
    this.difficultyLevel = this.route.snapshot.queryParamMap.get('level');
    if( this.invitedUser && this.difficultyLevel){
      if( this.difficultyLevel == "1"){
        this.gameService.emitInvite(this.invitedUser, GameMode.EASY);
      } else if ( this.difficultyLevel == "2"){
        this.gameService.emitInvite(this.invitedUser, GameMode.MEDIUM);
      } else {
        this.gameService.emitInvite(this.invitedUser, GameMode.HARD);
      }
    }
  }

  handlerAccept() {
    this.invitedUser = this.route.snapshot.queryParamMap.get('userId');
    this.difficultyLevel = this.route.snapshot.queryParamMap.get('level');
    if( this.invitedUser && this.difficultyLevel) {
      if( this.difficultyLevel == "1"){
        this.gameService.emitAcceptInvite(this.invitedUser, GameMode.EASY);
      } else if ( this.difficultyLevel == "2"){
        this.gameService.emitAcceptInvite(this.invitedUser, GameMode.MEDIUM);
      } else {
        this.gameService.emitAcceptInvite(this.invitedUser, GameMode.HARD);
      }
    }
    this.isGameOn = true;
  }

  ngOnInit() {
    this.gameService.handleConnection();
    this.gameObservableInit();
    this.invited = ('true' === this.route.snapshot.queryParamMap.get('invite'))
    this.accepted = ('true' === this.route.snapshot.queryParamMap.get('accept'))
    if( this.invited === true && this.accepted === false) {
      this.handlerInvite() }
    else if( this.accepted === true) {
      this.handlerAccept() }
  }

  setGame(event: number) {
    this.settledSide = false;
    this.gameService.startGameService(event);
    this.gameQueue = true;
  }
}
