import { InternalServerErrorException, Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from '../user/user.service';
import { User } from 'src/user/entities/user.entity';
import { Status } from 'src/user/utils/status.dto';
import { Player } from './utls/game';
import { MatchService } from './service/match.service';

@WebSocketGateway({ namespace: 'game' })
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(GameGateway.name)
  @WebSocketServer()
  server: Server

  constructor(private readonly userService: UserService,
              private readonly matchService: MatchService) {}

  afterInit() {
    this.logger.log("Initialized")
  }

  async handleConnection(@ConnectedSocket() client: Socket, ...args: any[]) {
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
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: string) {
    this.logger.debug(`Payload: ${data}`)
    this.server.emit('message', data)
  }



  @SubscribeMessage('match')
  async joinMatch(@ConnectedSocket() client: Socket, matchId?: string): Promise<void> {
    const match = await this.matchService.getCurrentMatch(matchId)
    const currentUser = await this.userService.getUserById(client.data.user.id)
    
    if (match && currentUser) {
      const player: Player = {
        user: currentUser,
        client: client
      }
      await this.matchService.joinMatch(player, match)
    }
    throw new InternalServerErrorException()
  }
}
