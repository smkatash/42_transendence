import { InternalServerErrorException, Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from '../user/user.service';
import { User } from 'src/user/entities/user.entity';
import { Status } from 'src/user/utils/status.dto';
import { MatchService } from './service/match.service';
import { Player } from './entities/player.entity';
import { PlayerService } from './service/player.service';
import { Game, GameState, MessageMatch} from './utls/game';

@WebSocketGateway({ namespace: 'game' })
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(GameGateway.name)
  @WebSocketServer()
  server: Server
  private sockets: Array<Socket> = []

  constructor(private readonly userService: UserService,
              private readonly playerService: PlayerService,
              private readonly matchService: MatchService) {}

  afterInit() {
    this.logger.log("Initialized")
  }

  async handleConnection(@ConnectedSocket() client: Socket, ...args: any[]) {
    this.logger.log(`Client id: ${client.id} connected`);
      //const userId = await this.authService.getUserSession(client)
      this.sockets.push(client)
      let user: User =  {"id":"99637","username":"ktashbae","status": 1, "avatar" : "test", "email": "test@email.com"}
      if (!user) {
        return client.disconnect()
      }
      user = await this.userService.updateUserStatus(user.id, Status.GAME)
      //const player = await this.playerService.createPlayer(user, client.id)
      let player = await this.playerService.getPlayerById(user.id)
      player = await this.playerService.updatePlayerClient(player, client.id)
      client.join(player.id)
      client.data.user = player
      client.emit('user', { player })
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`Cliend id:${client.id} disconnected`)
    this.sockets = this.sockets.filter(socket => socket !== client)
    return client.disconnect()
  }

  @SubscribeMessage('message')
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: string) {
    this.logger.debug(`Payload: ${data}`)
    this.server.emit('message', data)
  }


  @SubscribeMessage('start')
  async handleStartMatch(@ConnectedSocket() client: Socket) {
    if (!client.data.user.id) return
    this.logger.debug(client.data.user.id)
    const currentPlayer: Player = await this.playerService.getPlayerById(client.data.user.id)

    if (currentPlayer) {
      let playersInQueue: Player[] = await this.matchService.waitInQueue(currentPlayer)
      if (playersInQueue.length >= 2) {
        const match = await this.matchService.makeAmatch(playersInQueue)
        playersInQueue = await this.matchService.updateQueue(match.players)
        for (const player of playersInQueue) {
          if (player.id === currentPlayer.id) {
            client.emit('start', 'Waiting players to join.')
          }
        }

        for (const player of match.players) {
          if (player.id === currentPlayer.id) {
            client.join(match.id)
            client.emit('start', match)
          }
        }
      } else {
        client.emit('start', 'Waiting players to join.')
      }
      
    }
  }


  @SubscribeMessage('join')
  async handleJoinMatch(@ConnectedSocket() client: Socket, @MessageBody() matchId: string) {
    if (!client.data.user.id) return
    if (matchId) {
      this.logger.debug(matchId)
      const currentPlayer: Player = await this.playerService.getPlayerById(client.data.user.id)
      const game: Game = await this.matchService.joinMatch(currentPlayer, matchId)
      this.logger.debug(JSON.stringify(game))
      this.server.to(matchId).emit('join', game);
      await this.matchService.play(game, this.server)
    }
  }



  @SubscribeMessage('key')
  async handleKeyPress(@ConnectedSocket() client: Socket, @MessageBody() step: number) {
    if (!client.data.user.id) return
    const currentPlayer: Player = await this.playerService.getPlayerById(client.data.user.id)
     this.matchService.updatePlayerPosition(currentPlayer, step);
      
    }

  }

