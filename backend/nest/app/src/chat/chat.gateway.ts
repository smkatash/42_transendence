import { Logger, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChannelService } from './service/channel.service';
import { createChannelDto } from './dto/createChannel.dto';
import { Channel } from './entities/channel.entity';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { ChatUserService } from './service/chat-user.service';
import { SessionGuard } from 'src/auth/guard/auth.guard';

@WebSocketGateway({
  namespace: 'chat',
  //TODO temporel
  cors: '*'
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect{

  @WebSocketServer()
  server: Server;
  constructor(
    private readonly channelService: ChannelService,
    private readonly userService: UserService,
    private readonly chatUserService: ChatUserService
  ){}
  // clients: Map<Number, Socket>;

  // handleConnection(client: any, ...args: any[]) {
    @UseGuards(SessionGuard)
    /*async*/handleConnection(@ConnectedSocket() socket: Socket) {
    Logger.log('New connection:');
    console.log(socket.id)
    //TODO check session here
    // const user: User await etc
    // try {
    //   //get user
    //   if (!user)  {
    //     return this.disconect(socket);
    //   }  else  {
      // socket.data.user = user;
      // const channels = await this.channelService.getUsersChannels(user.id)
      // this.server.to(socket.id).emit('channels', channels)
  //  }
    // } catch {
    //   return this.disconect(socket)
    // }
  }

  //TODO set user ofline here
  async handleDisconnect(socket: Socket) {
    Logger.log('Client disconnected', socket)
    await this.chatUserService.deleteBySocketId(socket.id);
    socket.disconnect();
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    Logger.log('client:', client)
    Logger.log('payload:', payload)
    this.server.emit('message', `got a message: '${payload}'`)
    return 'Hello world!';
  }

  //bye bye

  private disconect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }

  @SubscribeMessage('createChannel')
  async onCreateChannel(socket: Socket, channel: createChannelDto): Promise<Channel>{
    const user: User = await this.userService.getUserById(socket.data.user)
    if (!user)
      console.log(socket)
    return // this.channelService.createChannel(channel, user);
  }

  @SubscribeMessage('typing')
  async typing(
    @MessageBody('isTyping') isTyping: boolean)  {

  }
}
