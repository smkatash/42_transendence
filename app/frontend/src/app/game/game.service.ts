import { EventEmitter, Injectable } from '@angular/core';
import { User , Game, GamePlayer, SocketResponse, GameMode, GameState, JoinMatchDto, PositionDto, GameModeDto } from '../entities.interface';
import { GameSocket } from '../app.module';
import { BehaviorSubject, Subject } from 'rxjs';
import { Socket } from 'ngx-socket-io';
import { ACCEPT_MATCH, INVITE_TO_MATCH, REJECT_MATCH } from '../chat/subscriptions-events-constants';
import { Router } from '@angular/router';

async function waitOneSecond() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // console.log("...");
}


@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(
    public socket: GameSocket,
    public router: Router) {
      }

      private gameInfoSubject: Subject <Game> = new Subject<Game>();
      private gameStatus = new BehaviorSubject<GameState>(0);
      private gameQueue : Subject<boolean> = new Subject<boolean>();
      private difficulty = 0;
      private matchInfo : SocketResponse;
      public  userInfo : User;
      public  gameInfo! : Game;


      getGameObservable() {
        return this.gameInfoSubject.asObservable();
      }
      getStatusQueue(){
        return this.gameQueue.asObservable();
      }

      getGameStatus() {
        return this.gameStatus;
      }

      setGameStatus(stat: number) {
        this.gameStatus.next(stat);
      }

      createMatchInfo(ID:string, level:number){
        const matchInfo : JoinMatchDto = {
          matchId: ID,
          mode: level
        }
        return matchInfo;
      }

      createPaddleDto(value: string){
        const retValue: PositionDto = {
          step: value
        }
        return retValue;
      }

      createGameDto(level: number){
        const gameMode: GameModeDto = {
          mode: level
        };
        return gameMode
      }

      handlerGameInfo(msg: any) {
        console.log("Received raw data from backend:");
        console.log(JSON.stringify(msg));

        this.gameInfo = msg;

        console.log("Updated gameInfo:");
        console.log(JSON.stringify(this.gameInfo));

        console.log("Receiving game info:" + this.gameInfo.status);

        this.gameInfoSubject.next(this.gameInfo);
        this.gameStatus.next(this.gameInfo.status!);
      }

      handlerGameStart( msg :any )  {
        if (msg === 'Waiting players to join') {
          console.log("Player in queue... Waiting for players to join");
          this.gameQueue.next(true);
        } else {
          this.matchInfo = msg;
          this.gameQueue.next(false);
          console.log("joining the match: " + this.matchInfo.id);
          this.emitJoinMatch();
        }
      }

      emitPaddlePosition(movementValue: string) {
        const toEmit = this.createPaddleDto(movementValue)
        this.socket.emit('key', toEmit);
      }

      emitJoinMatch() {
        const matchID = this.createMatchInfo(this.matchInfo.id, this.difficulty)
        this.socket.emit('join', matchID)
      }

      emitStart(difficulty: number){
        const gameMode = this.createGameDto(difficulty);
        this.socket.emit('start', gameMode);
      }

  public listenersOn : boolean  = false;
  listenersInit(){
    console.log("listeners on: " + this.listenersOn )
    if(this.listenersOn === false) {
      this.listenersOn = true;
      this.socket.on ('error',(msg:any) => { alert('Internal Server Error') })
      this.socket.on ('join', (msg: Game) => { console.log(JSON.stringify(msg))})
      this.socket.on ('game', (msg: any) => { this.handlerGameInfo( msg ) })
      this.socket.on ('start', (msg: any)  => { this.handlerGameStart(msg) })
      this.socket.on ('disconnect', () => {  this.handleDisconnection(); });
      this.socket.on ('connect', () => { console.log("CONNECTION " + this.socket.ioSocket.id) });
      this.socket.on ('queue', () => {console.log("Game rejected") ;alert("You're game invite was rejected")
      this.router.navigate(['/chat'])
      })
    }
  }


  startGameService(level: number): void {
		this.difficulty = level;
    this.emitStart(level)
    console.log("EMiTTING START + LEVEL");
	}

  handleDisconnection(){
    // this.listenersOn = false;
    // this.socket.removeAllListeners();
    console.log("Disconnection.");
  }

  handleConnection() {
    this.listenersInit();
  }

	getUser(): void {
    this.socket.on('user', (user: User) => {
      this.userInfo = user;
      console.log("USER: " + user.id );
    })
  }

  inviteToMatch(invitedUser: string, selectedMode: number) {
    console.log("Invited HERE");
    this.socket.emit(INVITE_TO_MATCH, { userId: invitedUser, mode: selectedMode })
  }

  acceptInvite(userID: string, mode: GameMode) {
    console.log("accepted Here");
    this.socket.emit(ACCEPT_MATCH, { userId: userID, mode: mode })
  }

  declineInvite(userID: string, mode: GameMode) {
    console.log("decline Here");
    this.socket.emit(REJECT_MATCH, { userId: userID, mode: mode })
  }
}
