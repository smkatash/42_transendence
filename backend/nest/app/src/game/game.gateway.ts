import { InternalServerErrorException, Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from '../user/user.service';
import { User } from 'src/user/entities/user.entity';
import { Status } from 'src/user/utils/status.dto';
import { MatchService } from './service/match.service';
import { Player } from './entities/player.entity';
import { PlayerService } from './service/player.service';
import { GameStatus, MessageMatch} from './utls/game';

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
      let user: User =  {"id":"99637","username":"ktashbae","status": 1, "avatar" : "test", "email": "test@email.com"}
      if (!user) {
        return client.disconnect()
      }
      user = await this.userService.updateUserStatus(user.id, Status.GAME)
      //const player = await this.playerService.createPlayer(user, client.id)
      // TODO to verify new player
      const player = await this.playerService.updatePlayerClient(user.id, client.id)

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
    this.logger.debug(client.data.user.id)
    const currentPlayer = await this.playerService.getPlayerById(client.data.user.id)
    if (currentPlayer) {
      this.logger.debug('getting queue')
      const playersStatus = await this.matchService.setStatusInQueue(currentPlayer)
      const playersInQueue = playersStatus.has(GameStatus.WAITING) ? playersStatus.get(GameStatus.WAITING) : []
      const playersToPlay = playersStatus.has(GameStatus.START) ? playersStatus.get(GameStatus.START) : []

      this.logger.debug(JSON.stringify(playersInQueue))
      this.logger.debug(JSON.stringify(playersToPlay))
      this.logger.debug(JSON.stringify(currentPlayer))
      if (playersInQueue && playersInQueue.some((player) => player.clientId === currentPlayer.clientId)) {
        this.logger.debug('players waiting')
        this.emitMessageToPlayers(client, 'start' , { message: 'Waiting players to join' })
      } else if (playersToPlay && playersToPlay.some((player) => player.clientId === currentPlayer.clientId)) {
        const match = await this.matchService.makeAmatch(playersToPlay)

        if (match.players.some((player) => player.clientId === currentPlayer.clientId)) {
          this.emitMessageToPlayers(client, 'start', {
            message: 'Ready to start',
            matchId: match.id
          })
        } else {
          this.emitMessageToPlayers(client, 'start',  { message: 'Waiting players to join' })
        } 
      } else {
        this.logger.debug('player not found')
        throw new InternalServerErrorException()
      }
    } else {
      this.logger.debug('player not found')
      throw new InternalServerErrorException()
    }
  }

  @SubscribeMessage('join')
  async joinMatch(@ConnectedSocket() client: Socket, @MessageBody() data: string) {
    if (data) {
    }

  }




  private emitMessageToPlayers(client: Socket, event: string, message: Object | MessageMatch): void {
        client.emit(event, message)
  }


}
