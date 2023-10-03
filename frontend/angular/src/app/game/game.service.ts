import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import {io} from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor( ) { }
  
  socket = io('http://127.0.0.1:3000/game');
  
  startGame(): void {
    // this.socket.on('connect', () => {
    //   console.log('Connected to WebSocket server');
    // });
    
    // this.socket.on('message', (data: any) => {
    //   console.log('Received message from server:', data);
    //   // You can update your component's data or UI here.
    // });

    // // Send a message to the server
    // this.socket.emit('start')
    this.socket.on('user', (user) => {
      console.log(user)
    })
    this.socket.emit('connect')
  }
}
