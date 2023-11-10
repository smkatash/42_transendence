import { Logger, UnauthorizedException, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { INGAME, ROUTE_CHANGE, USER, USER_PROFILE, USER_STATUS } from 'src/user/utils/rooms';
import { Status } from './utils/status.enum';
import { GetWsUser } from 'src/auth/utils/get-user.decorator';
import { WsAuthGuard } from 'src/auth/guard/ws-auth.guard';
import { User } from './entities/user.entity';
import { RouteDto } from './utils/router.dto';
import { ERROR } from './utils/rooms';
import { UserService } from './service/user.service';
import { UserIdDto } from './utils/user.dto';

@UsePipes(new ValidationPipe({whitelist: true}))
@WebSocketGateway({
	namespace: USER_PROFILE, 
	cors: {
		origin: '*'
	}})
export class UserGateway implements OnGatewayInit, OnGatewayConnection {
	private readonly logger = new Logger(UserGateway.name)
	@WebSocketServer()
	server: Server

	constructor(private userService: UserService) {}

	afterInit() {
		this.logger.log("Server is initialized")
	  }
	
	  async handleConnection(@ConnectedSocket() client: Socket) {
		let user = client.request[USER]
		try {
			if (!user) {
				throw new UnauthorizedException()
			}
			this.logger.log(`User: Client id: ${client.id} connected`)
			client.data.user = user
			this.logger.log(`User Client id: ${client.id} connected successfully`)
		} catch (error) {
			this.emitError(client, error)
		}
	}
	
	async handleDisconnect(@ConnectedSocket() client: Socket, ) {
		try {
			if (!client.data?.user?.id) throw new UnauthorizedException()
			const userStatus = await this.userService.updateUserStatus(client.data.user.id, Status.OFFLINE)
			client.to(userStatus.id).emit(ROUTE_CHANGE, userStatus.status)
			this.logger.log(`Cliend id:${client.id} disconnected`)
			return client.disconnect()
		} catch (error) {
			this.emitError(client, error)
		}
	  }

		@UseGuards(WsAuthGuard)
		@SubscribeMessage(ROUTE_CHANGE)
		async handleRouteChange(@ConnectedSocket() client: Socket, @GetWsUser() user: User, @MessageBody() routeDto: RouteDto) {
		try {
			if (user) {
				if (routeDto.route === INGAME) {
					const userStatus = await this.userService.updateUserStatus(user.id, Status.GAME)
					client.to(user.id).emit(USER_STATUS, userStatus.status)
				} else {
					const userStatus = await this.userService.updateUserStatus(user.id, Status.ONLINE)
					client.to(user.id).emit(USER_STATUS, userStatus.status)
				}
			}
			} catch(error) {
				this.emitError(client, error)
			}
		}

		@UseGuards(WsAuthGuard)
		@SubscribeMessage(USER_STATUS)
		async handleUserStatusChange(@ConnectedSocket() client: Socket, @GetWsUser() user: User, @MessageBody() userIdDto: UserIdDto) {
		try {
			if (user) {
				client.join(userIdDto.id)
			}
			} catch(error) {
				this.emitError(client, error)
			}
		}

		emitUserEvent(client: Socket, user: User) {
			client.emit(USER, user)
		}

		emitError(client: Socket, error: Error) {
			client.emit(ERROR, error)
			client.disconnect()
		}
}
