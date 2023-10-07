import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  namespace: 'chat',
  //TODO temporel
  cors: '*'
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
  //play
  @SubscribeMessage('toAll')
  spam(@MessageBody() data: string) {
    this.server.sockets.emit('receiveMsg', data);
  }
}
