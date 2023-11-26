import { EventEmitter, Injectable } from '@angular/core';
import { User , Game, GamePlayer, SocketResponse, GameMode, GameState, JoinMatchDto, PositionDto, GameModeDto } from '../entities.interface';
import { GameSocket } from '../app.module';
import { BehaviorSubject, Subject } from 'rxjs';
import { Socket } from 'ngx-socket-io';
import { ACCEPT_MATCH, INVITE_TO_MATCH } from '../chat/subscriptions-events-constants';
import { GameServiceUtils } from './utils';
import { Router } from '@angular/router';

async function waitOneSecond() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // console.log("...");
}


@Injectable({
  providedIn: 'root'
})
export class GameService {
	
  constructor(public socket: GameSocket, private router: Router) { }

// -------------------------------------------------------------------------------
//                                    * vars      *
// -------------------------------------------------------------------------------

  private obsGameInfo : Subject <Game> = new Subject<Game>();
  private obsGameStatus : BehaviorSubject<GameState> = new BehaviorSubject<GameState>(0);
  private obsGameQueue : Subject<boolean> = new Subject<boolean>();

  private difficulty = 0;
  public  userInfo : User;
  public  gameInfo! : Game;

// -------------------------------------------------------------------------------
//                                    * observable *
// -------------------------------------------------------------------------------
  getGameInfoObservable() { return this.obsGameInfo.asObservable(); }
  getGameQueueObservable() { return this.obsGameQueue.asObservable(); }
  getGameStatusObservable() { return this.obsGameStatus.asObservable(); }

  setGameStatusObservable(stat: number) { this.obsGameStatus.next(stat); }
  setGameInfoObservable( gameInfo: Game){ this.obsGameInfo.next( gameInfo); }
  setGameQueueObservable( status: boolean){ this.obsGameQueue.next( status ); }

// -------------------------------------------------------------------------------
//                                    * emitters *
// -------------------------------------------------------------------------------
  emitPaddlePosition(movementValue: string) {
    const toEmit = GameServiceUtils.createPaddleDto(movementValue)
    this.socket.emit('key', toEmit);
  }

  emitJoinMatch( matchInfo : SocketResponse ) {
    const matchID = GameServiceUtils.createMatchInfoDto(matchInfo.id, this.difficulty)
    this.socket.emit('join', matchID)
  }

  emitStart(difficulty: number){
		const gameMode = GameServiceUtils.createGameDto(difficulty);
		this.socket.emit('start', gameMode);
	}

  emitInvite(invitedUser: string,  mode: GameMode) {
	this.difficulty = mode;
    this.socket.emit("invite", { userId: invitedUser, mode: mode })
  }

  emitAcceptInvite(userID: string , mode: GameMode) {
	this.difficulty = mode;
    this.socket.emit("accept", { userId: userID, mode: mode })
  }
// -------------------------------------------------------------------------------
//                                    * listeners *
// -------------------------------------------------------------------------------

  public listenersOn : boolean  = false;
  listenersInit(){
    if(this.listenersOn === false) {
      this.listenersOn = true;
      this.socket.on ('error',(msg:any) => { alert('I am a teapot') })
      this.socket.on ('join', (msg: Game) => { console.log(JSON.stringify(msg))})
      this.socket.on ('game', (msg: any) => { this.handlerGameInfo( msg ) })
      this.socket.on ('start', (msg: any)  => { this.handlerGameStart(msg) })
      this.socket.on ('disconnect', () => {  this.handleDisconnection(); });
      this.socket.on ('connect', () => { });
      this.socket.on ('user', (user: User) => { this.userInfo = user; })
	    this.socket.on ('queue', () => { this.handleInviteRefuse(); })
    }
  }
// -------------------------------------------------------------------------------
//                                    * handlers *
// -------------------------------------------------------------------------------
  handleInviteRefuse(){
	alert("Your game invite was rejected");
	this.router.navigate(['/chat']);
  }


  handleDisconnection(){
	this.socket.emit("route-change");
  }

  handleConnection() {
    this.listenersInit();
  }

  handlerGameInfo(msg: any) {
    this.gameInfo = msg;
    this.setGameInfoObservable(this.gameInfo);
    this.setGameStatusObservable(this.gameInfo.status!);
  }

  handlerGameStart( msg :any )  {
    if (msg === 'Waiting players to join') {
      this.obsGameQueue.next(true);
	} else if(msg === 'Game does not exist'){
		alert(msg);
		this.router.navigate(['/chat']);

    } else {
      this.setGameQueueObservable(false);
      this.emitJoinMatch(msg);
    }
  }

// -------------------------------------------------------------------------------
//                                    * start *
// -------------------------------------------------------------------------------

	startGameService(level: number): void {
	  this.difficulty = level;
	  this.emitStart(level)
	}

  declineInvite(userID: string, mode: GameMode) {
    this.socket.emit("reject", { userId: userID, mode: mode })
  }
}


