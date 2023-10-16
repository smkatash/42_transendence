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
import { GetUser } from 'src/auth/utils/get-user.decorator';
import { transformAuthInfo } from 'passport';
import { JoinedChannelService } from './service/joined-channel.service';
import { MessageService } from './service/message.service';


@UseGuards(SessionGuard)
@WebSocketGateway({
  namespace: 'chat',
  //TODO temporel
  // cors: ['http://127.0.0.1:4200']
  cors: '*'
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit{

  @WebSocketServer()
  server: Server;
  constructor(
    private readonly channelService: ChannelService,
    private readonly userService: UserService,
    private readonly chatUserService: ChatUserService,
    private readonly joinedChannelService: JoinedChannelService,
    private readonly messageService: MessageService
  ){}

    async onModuleInit() {
      await this.chatUserService.deleteAll();
      await this.joinedChannelService.purge()
    }
    // @GetUser() user: User,
    async handleConnection( @ConnectedSocket() socket: Socket) {
    Logger.log('New CHAT connection:');
    console.log(socket.id)
    // console.log(socket)
    this.server.emit('message', 'test');
    //TODO check session here
    //testing
    // const userDto: AuthUserDto = {
      // id: '151',
      // username: 'test151',
      // title: 'the Tester',
      // avatar: '',
      // status: 1
    // }
    let user : User = await this.userService.findUserByName('hntest2');
    let chater = await this.chatUserService.findByUser(user);
    console.log(chater)
    if (chater)  {
      user = await this.userService.findUserByName('hntest1');
      chater = await this.chatUserService.findByUser(user);
    }
    
    console.log(chater)
    if (chater)  {
      return ;
    }
    // user = await this.userService.findUserByName('test151')
    // if (!user)  {
        // user = await this.userService.createUser(userDto);
    // }

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
    Logger.log('Client disconnected')
    console.log(socket.id)
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

  @SubscribeMessage('getChannelMessages')
  async onGetChannelMessages(socket: Socket, channel: Channel)  {
    const messages = await this.messageService.findMessagesByChannel(channel);
    this.server.to(socket.id).emit('messages', messages)
  }
}
