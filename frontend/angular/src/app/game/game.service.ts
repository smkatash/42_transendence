import { Injectable } from '@angular/core';
import { User } from '../entities.interface';
import { GameSocket } from '../app.module';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(private socket: GameSocket) {}

  startGame(): void {
    this.socket.on('start', (msg: string) => {
      console.log(msg)
    })

    this.socket.emit('start')
  }

  getUser(): void {
    this.socket.on('user', (user: User) => {
      console.log(user)
    })
  }
}
