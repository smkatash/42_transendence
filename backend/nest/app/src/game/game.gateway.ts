import {  Logger, UnauthorizedException } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from '../user/service/user.service';
import { Status } from 'src/user/utils/status.enum';
import { MatchService } from './service/match.service';
import { Player } from './entities/player.entity';
import { PlayerService } from './service/player.service';
import { Game} from './utls/game';
import { User } from 'src/user/entities/user.entity';
import { ERROR, INVITE_TO_MATCH, JOIN_MATCH, QUEUE, START_MATCH, USER, WAITING_MESSAGE } from './utls/rooms';
import { InvitedUserDto, JoinMatchDto, PositionDto } from './utls/message-dto';


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
    this.logger.log("Server is initialized")
  }

  async handleConnection(@ConnectedSocket() client: Socket) {
	let user = client.request[USER]
	try {
		if (!user) {
			throw new UnauthorizedException()
		}
		this.logger.log(`Client id: ${client.id} connected`);
		user = await this.userService.updateUserStatus(user.id, Status.GAME)
		client.data.user = user
		this.emitUserEvent(client, user)
	} catch (error) {
		this.emitError(client, error)
	}
}

async handleDisconnect(@ConnectedSocket() client: Socket) {
	try {
		if (!client.data.user.id) throw new UnauthorizedException()
		this.logger.log(`Cliend id:${client.id} disconnected`)
		await this.userService.updateUserStatus(client.data.user.id, Status.OFFLINE)
		return client.disconnect()
	} catch (error) {
		this.emitError(client, error)
	}
  }

  @SubscribeMessage('message')
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: string) {
    this.logger.debug(`Payload: ${data}`)
    this.server.emit('message', data)
  }

  @SubscribeMessage(START_MATCH)
  async handleStartMatch(@ConnectedSocket() client: Socket) {
	try {
		if (!client.data.user.id) throw new UnauthorizedException()
		const currentPlayer: Player = await this.playerService.getPlayerById(client.data.user.id)
		
		if (currentPlayer) {
		  let playersInQueue: Player[] = await this.matchService.waitInQueue(currentPlayer)
		  if (playersInQueue.length < 2) {
			client.join(QUEUE)
		  } else {
			const match = await this.matchService.makeAmatch(playersInQueue)
			playersInQueue = await this.matchService.updateQueue(match.players)
			const playerIdx = playersInQueue.findIndex(player => player.id === currentPlayer.id)
			if (playerIdx !== -1) {
				client.join(QUEUE)
			} else {
				client.leave(QUEUE)
				client.emit(START_MATCH, match)
			}
		  }
		  this.emitQueueEvent()
		}
	} catch(error) {
		this.emitError(client, error)
	}
  }

  @SubscribeMessage(INVITE_TO_MATCH)
  async handleInviteUserToMatch(@ConnectedSocket() client: Socket, @MessageBody() invitedUserDto: InvitedUserDto) {
    try {
		if (!client.data.user.id) throw new UnauthorizedException()
		const players = await this.playerService.getInvitedPlayers(client.data.user.id, invitedUserDto.userId )
		const match = await this.matchService.makeAmatch(players)
		client.emit(START_MATCH, match)
	} catch(error) {
		this.emitError(client, error)
	}
} 

  @SubscribeMessage(JOIN_MATCH)
  async handleJoinMatch(@ConnectedSocket() client: Socket, @MessageBody() matchDto: JoinMatchDto) {
	
   try {
	   if (!client.data.user.id) throw new UnauthorizedException()
	   const currentPlayer: Player = await this.playerService.getPlayerById(client.data.user.id)
	   if (currentPlayer) {
			client.join(matchDto.matchId)
			const game: Game = await this.matchService.joinMatch(matchDto.matchId, matchDto.mode)
			this.server.to(matchDto.matchId).emit(JOIN_MATCH, game)
			this.matchService.getServer(this.server)
			this.matchService.play()
	   }
   } catch(error) {
		this.emitError(client, error)
   }
}

  @SubscribeMessage('key')
  async handleKeyPress(@ConnectedSocket() client: Socket, @MessageBody() positionDto: PositionDto) {
	try {
		if (!client.data.user.id) throw new UnauthorizedException()

		const currentPlayer: Player = await this.playerService.getPlayerById(client.data.user.id)
		if (currentPlayer) {
			this.matchService.updatePlayerPosition(currentPlayer, parseInt(positionDto.step))
		}
	} catch(error) {
		this.emitError(client, error)
	}
} 
	
	emitError(client: Socket, error: Error) {
		client.emit(ERROR, error)
		client.disconnect()
	}

	emitUserEvent(client: Socket, user: User) {
		client.emit(USER, user)
	}

	emitQueueEvent() {
		this.server.to(QUEUE).emit(START_MATCH, WAITING_MESSAGE)
	}
}



