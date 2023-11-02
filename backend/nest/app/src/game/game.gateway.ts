import { Logger, UnauthorizedException, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from '../user/service/user.service';
import { Status } from 'src/user/utils/status.enum';
import { MatchService } from './service/match.service';
import { Player } from './entities/player.entity';
import { PlayerService } from './service/player.service';
import { Game} from './utls/game';
import { ERROR, JOIN_MATCH, POSITION_CHANGE, QUEUE, START_MATCH, USER, WAITING_MESSAGE } from './utls/rooms';
import { GameModeDto, JoinMatchDto, PositionDto } from './utls/message-dto';
import { WsAuthGuard } from 'src/auth/guard/ws-auth.guard';
import { GetWsUser } from 'src/auth/utils/get-user.decorator';


@UsePipes(new ValidationPipe({whitelist: true}))
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
		this.logger.log(`Client id: ${client.id} connected`)
		await this.userService.updateUserStatus(user.id, Status.GAME)
		const player = await this.playerService.getPlayerByUser(user)
		client.data.user = player
		this.emitUserEvent(client, player)
		this.logger.log(`Client id: ${client.id} connected successfully`)
	} catch (error) {
		this.emitError(client, error)
	}
}

async handleDisconnect(@ConnectedSocket() client: Socket, ) {
	try {
		if (!client.data?.user?.id) throw new UnauthorizedException()
		this.logger.log(`Cliend id:${client.id} disconnected`)
		await this.userService.updateUserStatus(client.data.user.id, Status.OFFLINE)
		this.matchService.leaveAllQueues(client.data.user.id)
		return client.disconnect()
	} catch (error) {
		this.emitError(client, error)
	}
  }


  @UseGuards(WsAuthGuard)
  @SubscribeMessage(START_MATCH)
  async handleStartMatch(@ConnectedSocket() client: Socket, @GetWsUser() user: Player, @MessageBody() gameMode: GameModeDto) {
	try {
		const currentPlayer: Player = await this.playerService.getPlayerById(user.id)
		
		if (currentPlayer) {
			client.join(QUEUE)
			await this.matchService.waitInPlayerQueue(currentPlayer, client, gameMode.mode)
		}
		this.emitQueueEvent()
	} catch(error) {
		this.emitError(client, error)
	}
}

//   @UseGuards(WsAuthGuard)
//   @SubscribeMessage(INVITE_TO_MATCH)
//   async handleInviteUserToMatch(@ConnectedSocket() client: Socket, @GetWsUser() user: Player, @MessageBody() invitedUserDto: InvitedUserDto) {
	// 	try {
		// 		//const match = await this.matchService.makeAmatch(user.id, [user.id, invitedUserDto.userId])
		// 		client.emit(START_MATCH, match)
		// 	} catch(error) {
			// 		this.emitError(client, error)
			// 	}
			// 	} 
			
	@UseGuards(WsAuthGuard)
	@SubscribeMessage(JOIN_MATCH)
	async handleJoinMatch(@ConnectedSocket() client: Socket, @GetWsUser() user: Player, @MessageBody() matchDto: JoinMatchDto) {
	try {
		console.log("THIS IS JOIN")
		const currentPlayer: Player = await this.playerService.getPlayerById(user.id)
		if (currentPlayer) {
			const game: Game = await this.matchService.joinMatch(matchDto.matchId, matchDto.mode)
			this.logger.debug(JSON.stringify(game))
			this.server.to(matchDto.matchId).emit(JOIN_MATCH, game)
			this.matchService.getServer(this.server)
			this.matchService.play()
	   }
   } catch(error) {
		this.emitError(client, error)
   }
}

	@UseGuards(WsAuthGuard)
	@SubscribeMessage(POSITION_CHANGE)
	async handleKeyPress(@ConnectedSocket() client: Socket, @GetWsUser() user: Player, @MessageBody() positionDto: PositionDto) {
	try {
		const currentPlayer: Player = await this.playerService.getPlayerById(user.id)
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