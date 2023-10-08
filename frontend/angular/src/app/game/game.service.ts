import { Injectable } from '@angular/core';
import { User , Game, GamePlayer, SocketResponse  } from '../entities.interface';
import { GameSocket } from '../app.module';
import { Subject } from 'rxjs';



async function waitOneSecond() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("...");
}


var matchID : string = "";
var gameInfo! : Game;

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(private socket: GameSocket) {}
  public test : number[] = [0,0];
  private testSubject = new Subject<number[]>();

  returnValue(){
    // return gameInfo;
    return this.test
  }

  getTestObservable() {
    return this.testSubject.asObservable();
  }


  startGame(): void {
    this.socket.on('join', (msg: any) => { })
    this.socket.on('play', (msg: any) => {
      gameInfo = msg;
      this.test[0] = gameInfo.ball.position.x
      this.test[1] = gameInfo.ball.position.y
      this.testSubject.next(this.test);
    })
    this.socket.on('start', (msg: any) => {
      if (msg == 'Waiting players to join.')
      {
        waitOneSecond();
        this.socket.emit('start');
      } else {
        const socketResponse : SocketResponse = msg;
        matchID = socketResponse.id
        this.socket.emit('join', matchID)
        console.log(socketResponse);
      }
    })
    this.socket.emit('start')
    // this.socket.disconnect();
  }

  getUser(): void {
    this.socket.on('user', (user: User) => {
      console.log(user)
    })
  }
}
