import {  Logger, UnauthorizedException, UsePipes } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from '../user/service/user.service';
import { Status } from 'src/user/utils/status.enum';
import { MatchService } from './service/match.service';
import { Player } from './entities/player.entity';
import { PlayerService } from './service/player.service';
import { Game} from './utls/game';
import { User } from 'src/user/entities/user.entity';
import { ERROR, INVITE_TO_MATCH, JOIN_MATCH, POSITION_CHANGE, QUEUE, START_MATCH, USER, WAITING_MESSAGE } from './utls/rooms';
import { GameModeDto, InvitedUserDto, JoinMatchDto, PositionDto } from './utls/message-dto';
import { WSValidationPipe } from './ws-validation-pipe';


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
		await this.userService.updateUserStatus(user.id, Status.GAME)
		const player = await this.playerService.getPlayerByUser(user, client.id);
		client.data.user = player
		this.emitUserEvent(client, player)
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

  @SubscribeMessage(START_MATCH)
  async handleStartMatch(@ConnectedSocket() client: Socket, @MessageBody() gameMode: GameModeDto) {
	try {
    if (!client.data.user.id) throw new UnauthorizedException()
		const currentPlayer: Player = await this.playerService.getPlayerById(client.data.user.id)
		
		if (currentPlayer) {
		  let playerIdsFromQueue: string[] = await this.matchService.waitInQueue(currentPlayer, gameMode.mode)
		  
		  if (!playerIdsFromQueue) {
			  client.join(QUEUE)
		  } else if (playerIdsFromQueue.includes(currentPlayer.id)) {
			const match = await this.matchService.makeAmatch(currentPlayer.id, playerIdsFromQueue)
			client.leave(QUEUE)
			client.emit(START_MATCH, match)
		  } else {
			client.join(QUEUE)
		  }
		}
		this.emitQueueEvent()
	} catch(error) {
		this.emitError(client, error)
	}
  }

  @SubscribeMessage(INVITE_TO_MATCH)
  async handleInviteUserToMatch(@ConnectedSocket() client: Socket, @MessageBody() invitedUserDto: InvitedUserDto) {
    try {
		if (!client.data.user.id) throw new UnauthorizedException()
		const match = await this.matchService.makeAmatch(client.data.user.id, [client.data.user.id, invitedUserDto.userId])
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

	// Todo check if pipe is working
  @UsePipes(new WSValidationPipe())
  @SubscribeMessage(POSITION_CHANGE)
  async handleKeyPress(@ConnectedSocket() client: Socket, @MessageBody() positionDto: PositionDto) {
	try {
		if (!client.data.user.id) throw new UnauthorizedException()

		this.logger.debug(JSON.stringify(positionDto))
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

	emitUserEvent(client: Socket, currentPlayer: Player) {
		client.emit(USER, currentPlayer)
	}

	emitQueueEvent() {
		this.server.to(QUEUE).emit(START_MATCH, WAITING_MESSAGE)
	}
}


