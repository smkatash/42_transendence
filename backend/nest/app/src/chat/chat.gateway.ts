import { Logger, UnauthorizedException } from '@nestjs/common';
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: 'chat',
  //TODO temporel
  cors: '*'
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect{

  @WebSocketServer()
  server: Server;
  constructor(){}
  // clients: Map<Number, Socket>;

  // handleConnection(client: any, ...args: any[]) {
    handleConnection(socket: Socket) {
    Logger.log('New connection:', socket);
    //TODO check session here
    // const user: User await etc
    // try {
    //   //get user
    //   if (!user)  {
    //     return this.disconect(socket);
    //   }  else  {
      // socket.data.user = user;
  //  }
    // } catch {
    //   return this.disconect(socket)
    // }
  }

  handleDisconnect(socket: Socket) {
    Logger.log('Client disconnected', socket)
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    Logger.log('client:', client)
    Logger.log('payload:', payload)
    this.server.emit('message', `got a message: '${payload}'`)
    return 'Hello world!';
  }
  //play
  @SubscribeMessage('toAll')
  spam(@MessageBody() data: string) {
    this.server.sockets.emit('receiveMsg', data);
  }

  //bye bye
  private disconect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }
}
