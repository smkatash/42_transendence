import { Injectable } from '@angular/core';
import { User } from '../entities.interface';
import { GameSocket } from '../app.module';



async function waitOneSecond() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("...");
}

interface Player {
  id: string;
  clientId: string;
  score: number;
  gameState: number;
  queue: any;
}

interface SocketResponse {
  id: string;
  status: number;
  players: Player[];
  scores: any;
}

var matchID : string = "";

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(private socket: GameSocket) {}
  
  startGame(): void {
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

    this.socket.on('join', (msg: any) => {
      console.log(msg);
    })

    this.socket.emit('start')
    // if(matchID != "")
  }

  getUser(): void {
    this.socket.on('user', (user: User) => {
      console.log(user)
    })
  }
}
