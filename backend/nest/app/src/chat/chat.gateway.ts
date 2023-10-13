import { Logger, OnModuleInit, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChannelService } from './service/channel.service';
import { CreateChannelDto } from './dto/channel.dto';
import { Channel } from './entities/channel.entity';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { ChatUserService } from './service/chat-user.service';
import { SessionGuard } from 'src/auth/guard/auth.guard';
import { UserDto } from 'src/user/utils/user.dto';
import { AuthUserDto } from 'src/auth/utils/auth.user.dto';

@WebSocketGateway({
  namespace: 'chat',
  //TODO temporel
  cors: '*'
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit{

  @WebSocketServer()
  server: Server;
  constructor(
    private readonly channelService: ChannelService,
    private readonly userService: UserService,
    private readonly chatUserService: ChatUserService
  ){}
  // clients: Map<Number, Socket>;
    async onModuleInit() {
      await this.chatUserService.deleteAll()
    }
  // handleConnection(client: any, ...args: any[]) {
    @UseGuards(SessionGuard)
    async handleConnection(@ConnectedSocket() socket: Socket) {
    Logger.log('New connection:');
    console.log(socket.id)
    //TODO check session here
    //testing
    const userDto: AuthUserDto = {
      id: '1',
      username: 'test1',
      title: 'the Tester',
      avatar: '',
      status: 1
    }
    
    let user : User = await this.userService.findUserByName(userDto.username);
    if (!user)  {
      user = await this.userService.createUser(userDto);
    }
    console.log(user)
    // const user: User await etc
    // try {
    //   //get user
      if (!user)  {
        return this.disconect(socket);
      }  else  {
      socket.data.user = user;
      console.log(await this.chatUserService.create(user, socket.id));
      // const channels = await this.channelService.getUsersChannels(user.id)
      // this.server.to(socket.id).emit('channels', channels)
  //  }
    // } catch {
    //   return this.disconect(socket)
    }
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
  async onCreateChannel(socket: Socket, channel: CreateChannelDto): Promise<Channel>{
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
