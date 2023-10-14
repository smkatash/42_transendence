import {  Logger, Req, Session, UseGuards } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from '../user/service/user.service';
import { User } from 'src/user/entities/user.entity';
import { Status } from 'src/user/utils/status.enum';
import { MatchService } from './service/match.service';
import { Player } from './entities/player.entity';
import { PlayerService } from './service/player.service';
import { Game, GameState, MessageMatch} from './utls/game';
import { SessionGuard } from 'src/auth/guard/auth.guard';
import { GetUser, GetWsUser } from 'src/auth/utils/get-user.decorator';
import { IncomingMessage } from 'http';
import { WsAuthGuard } from 'src/auth/guard/ws-auth.guard';
import { SessionUserDto } from 'src/user/utils/user.dto';

@WebSocketGateway({
	namespace: 'game', 
	cors: {
		origin: '*'
	}})
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

  async handleConnection(@ConnectedSocket() client: Socket, @GetWsUser() currentUser: any) {
	let user = client.request["user"]
	client.data.user = user
    this.logger.log(`Client id: ${client.id} connected`);

    if (!user) {
		console.log('disconnecting')
    	return client.disconnect()
     }
    user = await this.userService.updateUserStatus(user.id, Status.GAME)
    const player = await this.playerService.getPlayerByUser(user, client.id)
	this.logger.debug(player)
    client.join(player.id)
    client.emit('user', { player })
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
  async handleStartMatch(@ConnectedSocket() client: Socket) {
	console.log("bonjour putain")
    if (!client.data.user.id) return
    this.logger.debug(client.data.user.id)
    const currentPlayer: Player = await this.playerService.getPlayerById(client.data.user.id)


    if (currentPlayer) {
      let playersInQueue: Player[] = await this.matchService.waitInQueue(currentPlayer)
      // if (playersInQueue.length >= 2) {
        if (playersInQueue.length <= 2) {
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
        client.emit('start', 'Waiting players to join2.')
      }
      
    }
  }


  @SubscribeMessage('join')
  async handleJoinMatch(@ConnectedSocket() client: Socket, @MessageBody() matchId: string) {
    if (!client.data.user.id) return
    if (matchId) {
      // to fix later
      client.join(matchId)
      const currentPlayer: Player = await this.playerService.getPlayerById(client.data.user.id)
      if (currentPlayer) {
        const game: Game = await this.matchService.joinMatch(matchId)
        this.server.to(matchId).emit('join', game)
        this.logger.debug(matchId)
        this.matchService.getServer(this.server)
        this.matchService.play()
      }
    }
  }

  @SubscribeMessage('key')
  async handleKeyPress(@ConnectedSocket() client: Socket, @MessageBody() step: string) {
    if (!client.data.user.id) return
    const currentPlayer: Player = await this.playerService.getPlayerById(client.data.user.id)
     this.matchService.updatePlayerPosition(currentPlayer, parseInt(step))
    }
  }

