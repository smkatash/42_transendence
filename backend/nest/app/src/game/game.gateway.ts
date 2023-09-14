import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from '../user/user.service';
import { User } from 'src/user/entities/user.entity';
import { Status } from 'src/user/utils/status.dto';

@WebSocketGateway({ namespace: 'game' })
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(GameGateway.name)
  @WebSocketServer()
  server: Server

  constructor(private readonly userService: UserService) {}


  afterInit() {
    this.logger.log("Initialized")
  }

  async handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client id: ${client.id} connected`);
      //const userId = await this.authService.getUserSession(client)
      const user: Partial<User> =  {"id":"99637","username":"ktashbae","status":1}
      if (!user) {
        return client.disconnect()
      }

      await this.userService.updateUserStatus(user.id, Status.GAME)

      client.data.user = user
      client.emit('user', { user })
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`Cliend id:${client.id} disconnected`)
    return client.disconnect()
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    this.logger.debug(`Payload: ${data}`)
    this.server.emit('message', data)
  }

  @SubscribeMessage("ping")
  handlePing(@ConnectedSocket() client: Socket, @MessageBody() data: string) {
    this.logger.log(`Message received from client id: ${client.id}`)
    this.logger.debug(`Payload: ${data}`)
    return {
      event: "pong",
      data: "Wrong data that will make the test fail",
    }
  }

  @SubscribeMessage('game')
  joinGame(@ConnectedSocket() client: Socket, code?: string): void {
    if (!client.data.user) {
      return
    }
  }

}
