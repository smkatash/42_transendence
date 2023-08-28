import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class GameGateway {

  constructor() {}

  @WebSocketServer()
	server: Server


  @SubscribeMessage('action')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
