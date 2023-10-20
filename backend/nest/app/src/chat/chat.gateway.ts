import { BadRequestException, HttpStatus, Logger, OnModuleInit, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChannelService } from './service/channel.service';
import { CreateChannelDto, JoinChannelDto, UpdateChannelDto } from './dto/channel.dto';
import { Channel } from './entities/channel.entity';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/service/user.service';
import { ChatUserService } from './service/chat-user.service';
import { SessionGuard } from 'src/auth/guard/auth.guard';
import { UserDto } from 'src/user/utils/user.dto';
import { AuthUserDto } from 'src/auth/utils/auth.user.dto';
import { GetUser, GetWsUser } from 'src/auth/utils/get-user.decorator';
import { transformAuthInfo } from 'passport';
import { JoinedChannelService } from './service/joined-channel.service';
import { MessageService } from './service/message.service';
import { CreateMessageDto } from './dto/createMessage.dto';
import { JoinedChannel } from './entities/joinedChannel.entity';
import { error } from 'console';
import { ReturningStatementNotSupportedError } from 'typeorm';


// @UseGuards(SessionGuard)
@WebSocketGateway({
  namespace: 'chat',
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
      // await this.joinedChannelService.purge()
    }

  async handleConnection(
      @ConnectedSocket()
      socket: Socket,
  ) {
    Logger.log('New CHAT connection:');
    console.log(socket.id)
    console.log(socket.handshake.headers)
    const user = socket.request['user'];
    if (!user)  {
      Logger.error('Cookie expired')
    }
    // const c = await this.channelService.getChannelsByUser(user);
    // console.log(c);
    // console.log(user)
    // const u = await this.userService.getUserRelations(user.id);
    // console.log(u)
    // let user = (await this.userService.findAllByUsername('hntest2'))[0];
    if (!user)  {
      return this.disconect(socket);
    }  else  {
      socket.data.user = user;
      try {
        console.log(await this.chatUserService.create(user, socket.id));
        const conn = await this.joinedChannelService.findByUser(user);
        for (let c of conn){
          c.socketID = socket.id;
          await this.joinedChannelService.updateSocket(c);
        }
        console.log(conn)
      // return this.server.to(socket.id).emit('error', 'TEST ERrOR')
      // const channels = await this.channelService.getUsersChannels(user.id)
      // this.server.to(socket.id).emit('channels', channels)
  //  }
      } catch (error) {
        console.log(error);
        this.emitError(socket, error);
        return this.disconect(socket)
      }
    }
  }

  //TODO set user ofline here or at GameSocket
  async handleDisconnect(socket: Socket) {
    Logger.log('Client disconnected')
    console.log(socket.id)
    await this.chatUserService.deleteBySocketId(socket.id);
    socket.disconnect();
  }

  //bye bye
  private disconect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }

  //TODO validation pipe?
  @SubscribeMessage('createChannel')
  async onCreateChannel(
    @ConnectedSocket() socket: Socket,
    @MessageBody() channelInfo: CreateChannelDto) {

    const user = socket.data.user;
    if (!user) {
      return this.emitError(socket, 'No Access') ;
    }
    console.log(socket.data.user)
    console.log('channelCreate chanelInfo:', channelInfo)
    
    try {
      const channel = await this.channelService.createChannel(channelInfo, user);
      await this.joinedChannelService.create(user, socket.id, channel);
      const channels = await this.channelService.getAllChannels();
      this.server.to(socket.id).emit('allChannels', channels)
      this.server.to(socket.id).emit('success', `Created ${channelInfo.name}`)
    } catch  (error)  {
        Logger.error(error);
        this.server.to(socket.id).emit('error', error)
        return ;
    }
  }
  
  @SubscribeMessage('join')
  async onJoin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() joinInfo: JoinChannelDto
  ) {
    const user = socket.data.user;
    if (!user) {
      this.server.to(socket.id).emit('error', 'No access')
      return ;
    }
    try {
      const u = await this.userService.getUserRelations(user.id);

      console.log(u)
      const channel = await this.channelService.join(user, joinInfo);
      

      // const messages = await this.messageService.findMessagesByChannel(channel);
      const messages = await this.messageService.findMessagesForChannel(channel);
      await this.joinedChannelService.create(user, socket.id, channel);
      this.server.to(socket.id).emit('messages', messages);
    } catch (error) {
      Logger.error(error)
      this.emitError(socket, error)
    }
  }

  @SubscribeMessage('leave')
  async onLeave(
    @ConnectedSocket() socket: Socket,
    @MessageBody() id: number 
  ) {
    id = Number(id);
    const user = socket.data.user;
    if (!user) {
      this.server.to(socket.id).emit('error', 'No access')
      return ;
    } 
    //TODO temp
    //if admin ->delete channel
    const channel = await this.channelService.getChannel(id, [
      'users', 'admins'
    ])
    console.log(channel);
    channel.admins = channel.admins.filter((u)=> u.id !== user.id);
    channel.users = channel.users.filter((u) => u.id !== user.id);
    await this.channelService.saveChannel(channel);
    console.log('afterfilter', channel);
    await this.joinedChannelService.deleteBySocketId(socket.id, channel);
  }

  // @SubscribeMessage('newMessage')
  // async onNewMsg(
  //   @ConnectedSocket() socket: Socket,
  //   @MessageBody() msgInfo: CreateMessageDto 
  // ){
  //   const user = socket.data.user;
  //   if (!user) {
  //     this.server.to(socket.id).emit('error', 'No access')
  //     return ;
  //   }
  //   try {
  //     const channel = await this.channelService.getChannel(msgInfo.channelId);
  //     const newMsg = await this.messageService.newMessage(msgInfo.content, user, channel);
  //     const joinedUsers: JoinedChannel[] = await this.joinedChannelService.findByChannel(channel);
  //     //TODO emmt to all users 
  //   } catch (error) {
  //     this.emitError(socket, error)
  //   }
  // }

  // @SubscribeMessage('typing')
  // async typing(
  //   @MessageBody('isTyping') isTyping: boolean)  {

  // }

  @SubscribeMessage('getChannelMessages')
  // async onGetChannelMessages(socket: Socket, channel: Channel)  {
  async onGetChannelMessages(socket: Socket, channelId: number)  {
    const channel = await this.channelService.getChannel(channelId, []);
    if (!channel) {
      return this.emitError(socket, 'no such channel')
    }
    // const messages = await this.messageService.findMessagesByChannel(channel);

    const messages = await this.messageService.findMessagesForChannel(channel);
console.log(messages)
    this.server.to(socket.id).emit('channelMessages', messages)
  }

  @SubscribeMessage('newMsg')
  async onMessage(socket: Socket, message: CreateMessageDto) {
    const channel = await this.channelService.getChannel(message.channelId, []);
    if (!channel) {
      console.log('no channel')
      return this.emitError(socket, "No such channel")
    }
    // const user = await this.userService.findUserById(socket.data.user['id'])
    // if (!user)  {
    //   //bla bla
    // }
    console.log('----message-----')
    console.log(message)
    const newMsg = await this.messageService.newMessage(
      message.content, socket.data.user , channel 
    );
    const joinedUsers: JoinedChannel[] = await this.joinedChannelService.findByChannel(channel);
    console.log(joinedUsers);
    for (const user of joinedUsers)  {
      console.log("Emiting to channel")
      this.server.to(user.socketID).emit('incMsg', newMsg)
    }
  }
  @SubscribeMessage('getAllChannels')
  async onGetAllChannels(@ConnectedSocket() socket: Socket) {
    const user = socket.data.user;
      if (!user) {
        return  this.server.to(socket.id).emit('error', 'No access')
      }
    console.log("get all channels!!")
    try{
      const channels = await  this.channelService.getAllChannels();
      return this.server.to(socket.id).emit('allChannels', channels);
    } catch (error) {
      console.log(error);
      return this.emitError(socket, error)
    }

    
  }

  @SubscribeMessage('getUsersChannels')
  async getUsersChannels(@ConnectedSocket() socket: Socket) {
    const user = socket.data.user;
      if (!user) {
        return  this.server.to(socket.id).emit('error', 'No access')
      }
      console.log('get user\'s channesl')
      try{
        const channels = await this.channelService.getUsersChannels(user.id)
        console.log(channels);
        return this.server.to(socket.id).emit('usersChannels', channels);
      } catch (error) {
        console.log(error);
        return this.emitError(socket, error)
      }
  }

  //TODO ok this is big
  @SubscribeMessage('delete') 
    async onDelete(@ConnectedSocket() socket: Socket, id: number)  {
      const user = socket.data.user;
      if (!user) {
        return  this.server.to(socket.id).emit('error', 'No access')
      }
      //fuck relationships
      try {
        //TODO clean relations
        const channel = await this.channelService.getChannel(id, [
          'owner', 'users', 'messages.user', 'admins', 'joinedUsers'
        ]);
        if (!channel) {
          return this.emitError(socket, 'No such channel');
        }
        if (channel.owner?.id !== user.id) {
          return this.emitError(socket, new BadRequestException("No rights"))
        }
        //TODO 
        // user channel clear
        for (const message of channel.messages) {
          message.user.messages = message.user.messages.filter(msg => msg.id !== message.id);
        }
        await Promise.all(channel.messages.map(async (message) => {
          await this.userService.saveUser(message.user)
        }))
        await this.channelService.delete(channel.id);
      } catch (error) {
        Logger.error('fail on delete channel')
        console.log(error)
        this.emitError(socket, error)
      }
  }


  private emitError(socket: Socket, error: any) {
    this.server.to(socket.id).emit('error', error)
  }

  private success(socket: Socket ) {
    this.server.to(socket.id).emit('success', HttpStatus.OK)
  }

  @SubscribeMessage('kick')
  async kick(@ConnectedSocket() socket: Socket, @MessageBody() info: UpdateChannelDto)   {
    const user = socket.data.user;
    if (!user) {
      return  this.server.to(socket.id).emit('error', 'No access')
    } 
    try {
      const channel = await this.channelService.getChannel(Number(info.cId), [
        'owner', 'admins', 'users'
      ]);
      const u = await this.userService.getUserWith(info.uId, ['channels']);
      if (!channel || !u) {
        return this.emitError(socket, new BadRequestException('No such channel or user')) 
      }
      if (channel.owner?.id === info.uId) {
        return this.emitError(socket, new BadRequestException('Can\'t kick the owner'))
      }
      // if (channel?.owner?.id !== user.id)  {
        // return this.emitError(socket, new BadRequestException('No rights'));
      // }
      // if (channel?.owner?.id === user.id)  {
        // return this.emitError(socket, new BadRequestException('Can\'t remove self'));
      // }
      if (channel.admins.some((admin) => admin.id !== user.id)) {
        return this.emitError(socket, new BadRequestException('No rights')); 
      }
      // channel.admins = channel.admins.filter((admin) => admin.id !== u.id);
      channel.users = channel.users.filter((u) => u.id !== info.uId)
      u.channels = u.channels.filter((c) => c.id !== channel.id);
      await this.userService.saveUser(u);
      await this.channelService.saveChannel(channel);
      //TODO here
      console.log(await this.joinedChannelService.deleteByUserChannel(u, channel));
      this.server.to(socket.id).emit('channel', channel);
    } catch (error) {
      this.emitError(socket, error);
    }
  }

  @SubscribeMessage('ban')
  async onBan(@ConnectedSocket() socket: Socket, @MessageBody() info: UpdateChannelDto)   {
    
    const user = socket.data.user;
    console.log("ban sender", user)
    if (!user) {
      return  this.server.to(socket.id).emit('error', 'No access')
    } 
    try {
      console.log('qq')
      const channel = await this.channelService.getChannel(info.cId, [
        'owner', 'users', 'admins', 'banned'
      ]);
      console.log(channel);
      const u = await this.userService.getUserWith(info.uId, [
        'channels', 'adminAt', 'bannedAt'
      ]);
     console.log(u, channel); 
      if (!channel || !u) {
        return this.emitError(socket, new BadRequestException('No such channel or user')) 
      }
      if (channel.owner?.id === info.uId) {
        return this.emitError(socket, new BadRequestException('Can\'t ban the owner'))
      }
      // if (channel?.owner?.id !== user.id)  {
        // return this.emitError(socket, new BadRequestException('No rights'));
      // }
      // if (channel?.owner?.id === user.id)  {
        // return this.emitError(socket, new BadRequestException('Can\'t remove self'));
      // }
      if (channel.admins.some((admin) => admin.id !== user.id)) {
        return this.emitError(socket, new BadRequestException('No rights')); 
      }
      if (channel.banned.some((banned) => banned.id === user.id))  {
        return this.emitError(socket, new BadRequestException('Already banned'))
      }
      // channel.admins = channel.admins.filter((admin) => admin.id !== u.id);
      channel.users = channel.users.filter((u) => u.id !== info.uId)
      channel.admins = channel.admins.filter((admin) => admin.id !== info.uId);
      channel.banned.push(u);
      u.channels = u.channels.filter((c) => c.id !== channel.id);
      u.adminAt = u.adminAt.filter((adminAt) => adminAt.id !== channel.id)

      await this.userService.saveUser(u);
      await this.channelService.saveChannel(channel);
      //TODO here
      console.log(await this.joinedChannelService.deleteByUserChannel(u, channel));
      this.server.to(socket.id).emit('channel', channel);
    } catch (error) {
      this.emitError(socket, error);
    }
  }

  @SubscribeMessage('unban')
  async onUnban(@ConnectedSocket() socket: Socket, @MessageBody() info: UpdateChannelDto)   {
    
    const user = socket.data.user;
    if (!user) {
      return  this.server.to(socket.id).emit('error', 'No access')
    } 
    try {
      const channel = await this.channelService.getChannel(info.cId, [
        'owner', 'admins', 'users', 'banned'
      ]);
      const u = await this.userService.getUserWith(info.uId, [
        'channels', 'adminAt', 'bannedAt'
      ]);
      if (!channel || !u) {
        return this.emitError(socket, new BadRequestException('No such channel or user')) 
      }
      if (channel.owner?.id === info.uId) {
        return this.emitError(socket, new BadRequestException('Can\'t ban the owner'))
      }
      // if (channel?.owner?.id !== user.id)  {
        // return this.emitError(socket, new BadRequestException('No rights'));
      // }
      // if (channel?.owner?.id === user.id)  {
        // return this.emitError(socket, new BadRequestException('Can\'t remove self'));
      // }
      if (channel.admins.some((admin) => admin.id !== user.id)) {
        return this.emitError(socket, new BadRequestException('No rights')); 
      }
      if (channel.banned.some((banned) => banned.id === user.id))  {
        return this.emitError(socket, new BadRequestException('Already banned'))
      }
      // channel.admins = channel.admins.filter((admin) => admin.id !== u.id);
      channel.users = channel.users.filter((u) => u.id !== info.uId)
      channel.admins = channel.admins.filter((admin) => admin.id !== info.uId);
      channel.banned.push(u);
      u.channels = u.channels.filter((c) => c.id !== channel.id);
      u.adminAt = u.adminAt.filter((adminAt) => adminAt.id !== channel.id)

      await this.userService.saveUser(u);
      await this.channelService.saveChannel(channel);
      //TODO here
      console.log(await this.joinedChannelService.deleteByUserChannel(u, channel));
      this.server.to(socket.id).emit('channel', channel);
    } catch (error) {
      this.emitError(socket, error);
    }
  }
  //TODO
  async mute(user: User, userId: number, channelId: number)   {
     
  }
  @SubscribeMessage('addAdmin')
  async addAdmin(@ConnectedSocket() socket: Socket, @MessageBody() info: UpdateChannelDto)   {
    const user = socket.data.user;
    console.log('addAdmin', info);
    if (!user) {
      return  this.server.to(socket.id).emit('error', 'No access')
    } 
    try {
      const channel = await this.channelService.getChannel(info.cId, [
        'owner', 'admins'
      ]);
      // if (channel.admins.some((admin)=> admin.id !== user.id))  {
        // return this.emitError(socket, new BadRequestException('No rights'))
      // }

      let u = await this.userService.findUserById(info.uId);
      if (!u || !channel) {
        return this.emitError(socket, new BadRequestException('No such channel or user'))
      }
      if (channel?.owner?.id !== user.id) {
        channel.owner = user;
        await this.channelService.saveChannel(channel);
        return this.emitError(socket, new BadRequestException('No rights')) 
      }
      
      console.log(u)
      if (channel.admins.some((admin)=> admin.id === info.uId)) {
        console.log(`already in`)
        return this.emitError(socket, new BadRequestException('Already an admin'))
      }
      channel.admins.push(u);
      await this.channelService.saveChannel(channel);
      console.log(channel)
      // u = await this.userService.getUserWith(u.id, ['adminAt']);
      console.log(u)
      //TODO add users?
      this.server.to(socket.id).emit('channel', channel);
      this.success(socket);
    } catch (error) {
        console.log('catch error', error)
        return this.emitError(socket, error)
    }
  }
  @SubscribeMessage('delAdmin')
  async onDelAdmin(@ConnectedSocket() socket: Socket, @MessageBody() info: UpdateChannelDto)   {
    const user = socket.data.user;
    if (!user) {
      return  this.server.to(socket.id).emit('error', 'No access')
    } 
    try {
      const channel = await this.channelService.getChannel(info.cId, [
        'owner', 'admins'
      ]);
      const u = await this.userService.getUserWith(info.uId, ['adminAt']);
      if (!channel || !u) {
        return this.emitError(socket, new BadRequestException('No such channel or user')) 
      }
      if (channel?.owner?.id !== user.id)  {
        return this.emitError(socket, new BadRequestException('No rights'));
      }
      if (channel?.owner?.id === user.id)  {
        return this.emitError(socket, new BadRequestException('Can\'t remove self'));
      }
      channel.admins = channel.admins.filter((admin) => admin.id !== u.id);
      u.adminAt = u.adminAt.filter((c) => c.id !== channel.id);
      await this.userService.saveUser(u);
      await this.channelService.saveChannel(channel);
      this.server.to(socket.id).emit('channel', channel);
    } catch (error) {
      this.emitError(socket, error);
    }
  }
  async inviteToGame(user: User, userId: number, channelId: number)   {
     
  }

  async inviteToPrivate(user: User, userId: number, channelId: number) {

  }

  async password(user: User, oldPass: string, newPass: string)   {

  }
}