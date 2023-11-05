import { EventEmitter, Injectable } from '@angular/core';
import { User , Game, GamePlayer, SocketResponse, GameMode, GameState, JoinMatchDto, PositionDto, GameModeDto } from '../entities.interface';
import { GameSocket } from '../app.module';
import { BehaviorSubject, Subject } from 'rxjs';

async function waitOneSecond() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // console.log("...");
}

var matchID : string = "";
var gameInfo! : Game;

@Injectable({
  providedIn: 'root'
})
export class GameService {

  height = 1000;
  width = 500;

  constructor(private socket: GameSocket) {}
  public test : number[] = [0,0];

  // GAME INFO: Ball position, paddle, id, bla bla
  private gameInfoSubject: Subject <Game> = new Subject<Game>();
  private gameStatus = new BehaviorSubject<GameState>(0);
  // QUEUE, player waiting in that.
  private inTheQueue : Subject<boolean> = new Subject<boolean>();
  public keyPress: EventEmitter<string> = new EventEmitter();
  public started = false;
  public userInfo : User;
  private difficulty = 0;
  private matchInfo : SocketResponse;

  // private testSubject = new Subject<number[]>();
  paddlePosition: string = '0';

  updateSize(w: number, h: number) {
    this.width = w;
    this.height = h;
  }

  returnValue(){
    // return gameInfo;
    return this.test
  }

  // observable-----------------------------------------
  getGameObservable() {
    return this.gameInfoSubject.asObservable();
  }
  getStatusQueue(){
    return this.inTheQueue.asObservable();
  }

  getGameStatus() {
    return this.gameStatus;
  }

  setGameStatus(stat: number) {
    this.gameStatus.next(stat);
  }
  // utils----------------------------------------------

  matchIsLeftSide(){
	if(this.matchInfo){
		if (this.userInfo.id === this.matchInfo.players[0].id) {
			return true;
		}
		// console.log("ON THE RIGHT 1")
		return false;
	}
	  // console.log("ON THE RIGHT 2")
	return true
  }
  // join
  createMatchInfo(ID:string, level:number){
    const matchInfo : JoinMatchDto = {
      matchId: ID,
      mode: level
    }
    return matchInfo;
  }
  // emit paddle
  createPaddleDto(value: string){
    const retValue: PositionDto = {
      step: value
    }
    return retValue;
  }
  // play
  createGameDto(level: number){
    const gameMode: GameModeDto = {
      mode: level
    };
    return gameMode
  }

  padlePositionEmitter(movementValue: string) {
    const toEmit = this.createPaddleDto(movementValue)
    this.socket.emit('key', toEmit);
    //console.log(toEmit);
  }
  listenersOn = false;
  listenersInit(){
    this.listenersOn = true;
    this.socket.on ('join', (msg: Game) => { 
    })
    this.socket.on ('game', (msg: any) => {
      gameInfo = msg;
      if(gameInfo.status === GameState.END){
        ;
      }
      this.gameInfoSubject.next(gameInfo);
      this.gameStatus.next(gameInfo.status!);
    })
    this.socket.on ('start', (msg: any)  => {
      if (msg === 'Waiting players to join')
      { this.inTheQueue.next(true);
      } else {
        this.inTheQueue.next(false);
        this.matchInfo = msg;
		if (this.matchInfo.id) {
			const matchID = this.createMatchInfo(this.matchInfo.id, this.difficulty)
			this.socket.emit('join', matchID)
		}}
		})
	}

	queueEmit(){
		const gameMode = this.createGameDto(this.difficulty);
		this.socket.emit('start', gameMode);
	}

	startGameService(level: number): void {
		this.difficulty = level;
    if(this.listenersOn === false){
      this.listenersInit();
    }
		const gameMode = this.createGameDto(this.difficulty);
		this.socket.emit('start', gameMode);
	}

	getUser(): void {
	this.socket.on('user', (user: User) => {
		this.userInfo = user;
	})
	}
}
