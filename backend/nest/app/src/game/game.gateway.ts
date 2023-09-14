import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'game' })
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(GameGateway.name)
  @WebSocketServer()
  server: Server


  afterInit() {
    this.logger.log("Initialized")
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client id: ${client.id} connected`);
      // const user = await this.authService.getUserFromSocket(client)
      // if (!user) return client.disconnect()

      //await this.userService.setStatus(user.id, Status.GAME);

      // client.data.user = user;
      // client.emit('user', { user });
  }

  handleDisconnect(client: any) {
    this.logger.log(`Cliend id:${client.id} disconnected`);
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    this.logger.debug(`Payload: ${data}`);
    this.server.emit('message', data);
  }

  @SubscribeMessage("ping")
  handlePing(client: any, data: any) {
    this.logger.log(`Message received from client id: ${client.id}`)
    this.logger.debug(`Payload: ${data}`);
    return {
      event: "pong",
      data: "Wrong data that will make the test fail",
    }
  }
}
