import { InternalServerErrorException, Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from '../user/user.service';
import { User } from 'src/user/entities/user.entity';
import { Status } from 'src/user/utils/status.dto';
import { MatchService } from './service/match.service';
import { Player } from './entities/player.entity';
import { PlayerService } from './service/player.service';
import { GameStatus, MessageMatch } from './utls/game';

@WebSocketGateway({ namespace: 'game' })
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(GameGateway.name)
  @WebSocketServer()
  server: Server

  constructor(private readonly userService: UserService,
              private readonly playerService: PlayerService,
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


  @SubscribeMessage('start')
  async startMatch(@ConnectedSocket() client: Socket) {
    const currentPlayer = await this.playerService.getPlayerById(client.data.user.id)

    if (currentPlayer) {
      const playersStatus = await this.matchService.setStatusInQueue(currentPlayer)
      if (playersStatus.has(GameStatus.WAITING)) {
        const waitingPlayers = playersStatus.get(GameStatus.WAITING) || []
        this.emitMessageToPlayers(waitingPlayers, 'start' , { message: 'Waiting players to join' })
      } else {
        const playersToStart = playersStatus.get(GameStatus.START) || []
        const match = await this.matchService.makeAmatch(playersToStart)
        this.emitMessageToPlayers(match.players, 'start', {
          message: 'Ready to start',
          matchId: match.id
        })

        const playersToWait = playersToStart.filter(player => !match.players.includes(player))
        this.emitMessageToPlayers(playersToWait, 'start',  { message: 'Waiting players to join' })
      }
    } else {
      throw new InternalServerErrorException()
    }
  }

  @SubscribeMessage('join')
  async joinMatch(@ConnectedSocket() client: Socket, @MessageBody() data: string) {
    if (data) {
    }

  }




  private emitMessageToPlayers(players: Player[], event: string, message: Object | MessageMatch): void {
    for (const player of players) {
      const playerSocket: Socket = this.server.sockets[player.clientId];
    
      if (playerSocket) {
        playerSocket.emit(event, message);
      } else {
        throw new InternalServerErrorException('Socket not found');
      }
    }
  }

  

}
