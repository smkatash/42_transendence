import { BadRequestException, HttpStatus, Logger, OnModuleInit, UnauthorizedException, UsePipes, ValidationPipe } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChannelService } from './service/channel.service';
import { ChannelPasswordDto, ChannelToFeDto, CreateChannelDto, JoinChannelDto, PrivMsgDto, UpdateChannelDto, cIdDto, uIdDto } from './dto/channel.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/service/user.service';
import { ChatUserService } from './service/chat-user.service';
import { JoinedChannelService } from './service/joined-channel.service';
import { MessageService } from './service/message.service';
import { CreateMessageDto } from './dto/createMessage.dto';
import { JoinedChannel } from './entities/joinedChannel.entity';
import { MuteService } from './service/mute.service';
import { Channel } from './entities/channel.entity';
import { Message } from './entities/message.entity';
import { ADD_ADMIN, BAN, BLOCK, CHANNEL, CHANNELS, CHANNEL_MESSAGES, CHANNEL_USERS, CREATE, DECLINE_PRIVATE_INVITE, DELETE, DIRECT, ERROR, INVITE_TO_PRIVATE, JOIN, KICK, LEAVE, MESSAGE, MUTE, PASSWORD, REM_ADMIN, SUCCESS, UNBAN, UNBLOCK, USER_CHANNELS } from './subscriptions-events-constants';


@UsePipes(new ValidationPipe({whitelist: true}))
@WebSocketGateway({
  namespace: 'chat',
  cors: '*'
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit  {

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly channelService: ChannelService,
    private readonly userService: UserService,
    private readonly chatUserService: ChatUserService,
    private readonly joinedChannelService: JoinedChannelService,
    private readonly messageService: MessageService,
    private readonly muteService: MuteService
  ){}

    async onModuleInit() {
      await this.chatUserService.deleteAll();
      await this.muteService.purge();
      await this.joinedChannelService.purge()
    }

  async handleConnection(@ConnectedSocket() socket: Socket) {

    Logger.log('New CHAT connection:');
    console.log(socket.id)
    console.log(socket.handshake.headers)

    const user = socket.request['user'];
    if (!user)  {
      Logger.error('Cookie expired')
    }
    if (!user)  {
      return this.noAccess(socket);
    }  else  {
      socket.data.user = user;
      try {
        /*console.log*/(await this.chatUserService.create(user, socket.id));
        /*
          to connect to private messages initilaized while user offline,
          damit privat messaging history exists
        */
        const u = await this.userService.getUserWith(user.id, [
          'channels'
        ]);
        // console.log(u)
        if (u.channels) {
          for (const channel of u.channels) {
            const jC = await this.joinedChannelService.findByChannelUser(channel, u);
            console.log ('old', jC)
            if (!jC)  {
              console.log('new', await this.joinedChannelService.create(user, socket.id, channel));
            } else  {
              if (jC.socketId !== socket.id)  {
                jC.socketId = socket.id;
                console.log('updated', await this.joinedChannelService.updateSocket(jC));
              }
            }
          }
        }
      } catch (error) {
        console.log(error);
        this.emitError(socket, error);
        return this.noAccess(socket)
      }
    }
  }

  //TODO set user offline here or at GameSocket
  async handleDisconnect(socket: Socket) {

    Logger.log('Client disconnected')
    console.log(socket.id)

    await this.chatUserService.deleteBySocketId(socket.id);
    socket.disconnect();
  }

  //bye bye
  private noAccess(socket: Socket) {
    socket.emit('error', new UnauthorizedException());
    socket.disconnect();
  }

  @SubscribeMessage(CREATE)
  async onCreateChannel(@ConnectedSocket() socket: Socket,
    @MessageBody() channelInfo: CreateChannelDto) {

    const user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    console.log(socket.data.user)
    console.log('channelCreate chanelInfo:', channelInfo)
    try {
      const channel = await this.channelService.createChannel(channelInfo, user);
      await this.joinedChannelService.create(user, socket.id, channel);
      this.onGetUsersChannels(socket);
      this.server.to(socket.id).emit('success', `Created ${channelInfo.name}`)
      this.newPublic();
    } catch  (error)  {
        Logger.error(error);
        this.server.to(socket.id).emit('error', error)
        return ;
    }
  }

  private async newPublic() {

    const publicChannels: ChannelToFeDto[] = (await this.channelService.getAllChannels())
          .filter((c) => !c.private)
          .map((c) => this.channelToFe(c));
    const onlineUsers = await this.chatUserService.getAll();
    for (const onlineUser of onlineUsers) {
      this.server.to(onlineUser.socketId).emit(CHANNELS, publicChannels)
    }
  }
  
  
  private async emitTOChatUsers(event: string, criteria: User[], info: User[] | Channel[]) {
    const chatUsers = await this.chatUserService.getAll();
    for (const chatUser of chatUsers)  {
      if (criteria.some((u) => u.id === chatUser.user.id))  {
        this.server.to(chatUser.socketId).emit(event, info)
      }
    }
  }

  @SubscribeMessage(JOIN)
  async onJoin(@ConnectedSocket() socket: Socket,
    @MessageBody() joinInfo: JoinChannelDto) {

    const user = socket.data.user;
    if (!user) {
      return this.emitError(socket, 'No Access');
    }
    console.log(joinInfo);
    try {
      const channel = await this.channelService.join(user, joinInfo);
      if (channel.private)  {
        const u = await this.userService.getUserWith(user.id, [
          'invitedTo'
        ]);
        u.invitedTo = u.invitedTo.filter((c) => c.id !== channel.id);
        await this.userService.saveUser(u);
      }
      await this.joinedChannelService.create(user, socket.id, channel);
      /**
       * depends on logic here,
       */
      // this.onGetChannelMessages(socket, {cId: channel.id})
      this.onGetUsersChannels(socket);
      this.onGetAllChannels(socket);
    } catch (error) {
      Logger.error(error)
      this.emitError(socket, error)
    }
  }

  @SubscribeMessage(LEAVE)
  async onLeave(@ConnectedSocket() socket: Socket,
    @MessageBody() channelInfo: cIdDto) {

    const user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    } 
    try {
      const channel = await this.channelService.getChannel(channelInfo.cId, [
        'owner', 'users', 'admins'
      ])
      if (!channel) {
        return this.emitError(socket, new BadRequestException('No such channel'))
      }
      console.log(channel);
    //delete channel if owner leaves
      if (user.id === channel.owner?.id)  {
        return this.onDelete(socket, channelInfo);
      }
      channel.admins = channel.admins.filter((u)=> u.id !== user.id);
      channel.users = channel.users.filter((u) => u.id !== user.id);
      const u = await this.userService.getUserWith(user.id, [
        'channels', 'adminAt'
      ]);
      u.channels = u.channels.filter((c) => c.id !== channel.id);
      u.adminAt = u.adminAt.filter((c) => c.id !== channel.id )
      await this.channelService.saveChannel(channel);
      await this.userService.saveUser(u);
      console.log('afterfilter', channel);
      await this.joinedChannelService.deleteBySocketId(socket.id, channel);
      //emit user's channels
      if (channel.users.length === 0) {
        this.onDelete(socket, channelInfo);
      }
      this.onGetUsersChannels(socket);
    } catch (error) {
      console.log(error);
      this.emitError(socket, error)
    }
  }

  // @SubscribeMessage('typing')
  // async typing(
  //   @MessageBody('isTyping') isTyping: boolean)  {

  // }

  @SubscribeMessage(CHANNEL_MESSAGES)
  async onGetChannelMessages(@ConnectedSocket() socket: Socket,
    @MessageBody() channelInfo: cIdDto)  {

    const user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    const channel = await this.channelService.getChannel(channelInfo.cId, [
      'users'
    ]);
    if (!channel) {
      return this.emitError(socket, 'No such channel')
    }
    if (!(channel.users.some((u) => u.id === user.id))) {
      throw new BadRequestException('User not on the channel')
    }
    // const messages = await this.messageService.findMessagesByChannel(channel);
    const u = await this.userService.getUserWith(user.id, [
      'blockedUsers'
    ]);
    let messages = await this.messageService.findMessagesForChannel(channel);
    console.log(messages);
    for (const blockedUser of u.blockedUsers) {
      console.log(blockedUser);
      messages = messages.filter((msg: Message) => msg.user.id !== blockedUser.id);
    }
    console.log(messages);
    messages.sort((m1, m2) => m1.createdAt.getTime() - m2.createdAt.getTime());

    const msgsToFe = messages.map((m) =>  {
      if (user.id === m.user.id)  {
        m['sessionUser'] = true
      } else  {
        m['sessionUser'] = false
      }
      return m;
    })
    this.server.to(socket.id).emit(CHANNEL_MESSAGES, msgsToFe);
  }

  @SubscribeMessage(MESSAGE)
  async onMessage(socket: Socket, message: CreateMessageDto) {

    const user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    try {
      const channel = await this.channelService.getChannel(message.cId, [
        'users'
      ]);
      if (!channel) {
        console.log('no channel')
        return this.emitError(socket, "No such channel")
      }
      if (!(channel.users.some((u) => u.id === user.id))) {
        throw new BadRequestException('User not on the channel')
      }
      console.log('----message-----')
      console.log(message)
      const isMuted = await this.muteService.getMute(user.id, channel.id);
      if (isMuted)  {
        console.log(isMuted.mutedUntil.getTime(), new Date().getTime())
        if (isMuted.mutedUntil.getTime() > new Date().getTime() )  {
          return this.emitError(socket, new BadRequestException('You\'re muted'));
        } else  {
          await this.muteService.deleteMute(isMuted.id);
        }
      }
      const newMsg = await this.messageService.newMessage(
        message.content, socket.data.user , channel 
      );
      const joinedUsers: JoinedChannel[] = await this.joinedChannelService.findByChannel(channel);
      // console.log(joinedUsers);
      console.log('Emitting:', newMsg);
      for (const user of joinedUsers)  {
        // console.log(user);
        const u = await this.userService.getUserWith(user.user.id, [
          'blockedUsers'
        ])
        // console.log(u);
        if (u.blockedUsers.some((blockedUser) => blockedUser.id === newMsg.user.id)) {
          console.log(`skipping ${user.user.username}`)
          continue ;
        }
        if (u.id === newMsg.user.id)  {
          newMsg['sessionUser'] = true
        } else  {
          newMsg['sessionUser'] = false
        }
        // console.log('sessionUser should be there', newMsg);
        this.server.to(user.socketId).emit(MESSAGE, newMsg)
        console.log(`emitting to ${user.user.username}`)
      }
    } catch (error) {
      console.log(error)
      this.emitError(socket, error);
    }
  }

  @SubscribeMessage(CHANNELS)
  async onGetAllChannels(@ConnectedSocket() socket: Socket) {
    
    const user = socket.data.user;
      if (!user) {
        return this.noAccess(socket);
      }
    // console.log("get all channels!!")
    try {
      const channels = await  this.channelService.getAllChannels();
      // console.log(channels)
      //Removing password and dates and stuff
      const cToFe = channels.filter((c) => !(c.private)).map((c) => this.channelToFe(c))
        .sort((c1, c2) => c1.updatedAt.getDate() - c2.updatedAt.getDate())
        .filter((c) => {
          if (!(c.users.some((u) => u.id === user.id))) {
            return c;
          }
        });
      // console.log(cToFe)
      this.server.to(socket.id).emit(CHANNELS, cToFe);
      // this.server.to(socket.id).emit('allChannels', channels);
    } catch (error) {
      console.log(error);
      return this.emitError(socket, error)
    }
  }

  @SubscribeMessage(USER_CHANNELS)
  async onGetUsersChannels(@ConnectedSocket() socket: Socket) {

    const user = socket.data.user;
      if (!user) {
        return this.noAccess(socket);
      }
      // console.log('get user\'s channesl')
      try{
        const channels = await this.channelService.getUsersChannels(user.id)
      //Removing password and dates and stuff
        const cToFe = channels
          .sort((c1, c2) => c2.updatedAt.getTime() - c1.updatedAt.getTime())
          .map((c) => this.channelToFe(c))
          .map((c) => {
            if (c.name) {
              return c
            } else  {
              for (const u of c.users)  {
                if (u.id !== user.id) {
                  c.name = u.username;
                  c.avatar = u.avatar
                }
              }
              return c
            }
          }
        );
        this.server.to(socket.id).emit(USER_CHANNELS, cToFe);
        // this.server.to(socket.id).emit('usersChannels', channels);
      } catch (error) {
        console.log(error);
        /*return*/ this.emitError(socket, error)
      }
  }

  //TODO ok this is big, still needs doubletriplecheck
  @SubscribeMessage(DELETE) 
  async onDelete(@ConnectedSocket() socket: Socket,
    @MessageBody() cId: cIdDto)  {

    const user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    //fuck relationships
    try {
      //TODO clean relations CHECK IF CLEAN
      const channel = await this.channelService.getChannel(cId.cId, [
        'owner', 'users', 'messages.user', 'admins', 'joinedUsers', 'messages',
        'messages.user.messages', 'banned'
      ]);
      if (!channel) {
        return this.emitError(socket, 'No such channel');
      }
      console.log('CHANNEL TO DELETE', channel);
 //TODO
 //tmp need some logic about private messaging
      if (channel.owner)  {
        if (channel.owner?.id !== user.id) {
          return this.emitError(socket, new BadRequestException("No rights"))
        }
      }
        //clean messages
      for (const message of channel.messages) {
        // console.log(message.user.messages);
        if (message?.user?.messages)  {
          message.user.messages = message.user.messages.filter(msg => msg.id !== message.id);
            // console.log('BUBU')
          }
      }
      //  console.log('qqqq', channel.messages); 
      await Promise.all(channel.messages.map(async (message) => {
        console.log(message.user.messages)
        await this.userService.saveUser(message.user)
      }))
        // 
      for (const user of channel.users) {
        const u = await this.userService.getUserWith(user.id, [
          'channels', 'adminAt', 'joinedChannels', 'joinedChannels.channel', 'ownedChannels'
        ]);
        console.log(u);
        if (u.channels) {
          u.channels = u.channels.filter((c) => c.id !== channel.id);
        }
        if (u.adminAt)  {
          u.adminAt = u.adminAt.filter((c) => c.id !== channel.id);
        }
        if (u.joinedChannels) {
          console.log(u.joinedChannels)
          u.joinedChannels = u.joinedChannels.filter((jC) => jC.channel.id !== channel.id);
        }
        if (u.ownedChannels)  {
          u.ownedChannels = u.ownedChannels.filter((ownedC) => ownedC.id !== channel.id)
        }
        await this.userService.saveUser(u);
      }
      for (const banned of channel.banned)  {
        const user = await this.userService.getUserWith(banned.id, [
         'bannedAt'
        ]);
        user.bannedAt = user.bannedAt.filter((c) => c.id !== channel.id);
        await this.userService.saveUser(user);
      }
      for (const banned of channel.banned)  {
        const user = await this.userService.getUserWith(banned.id, [
          'invitedTo'
        ]);
        user.invitedTo = user.invitedTo.filter((c) => c.id !== channel.id);
        await this.userService.saveUser(user);
      }
            //TODO we'll see some emtiting here, not sure if needed
      
      //DAMN thats not nice
      //Updating channel lists for FE
      const chatUsers = await this.chatUserService.getAll();
/*      const cToFe = ((await this.channelService.getAllChannels()))
            .map((c) => this.channelToFe(c))
            .filter((c) => !c.private);*/
      for (const chatUser of chatUsers) {
        // this.server.to(chatUser.socketId).emit(CHANNELS, cToFe);
        if (channel.users.some((u) => chatUser.user.id === u.id)) {
          const cToFe = (await this.channelService.getUsersChannels(chatUser.user.id))
                .map((c) => this.channelToFe(c));
          // console.log("UPDATING DELETED CHANNEL USERS CHANNEL LIST")
          this.server.to(chatUser.socketId).emit(USER_CHANNELS, cToFe);
        }
      }
      await this.muteService.deleteMutesByChannel(channel.id);
      await this.joinedChannelService.deleteByChannel(channel);
      await this.messageService.deleteByChannel(channel);
      await this.channelService.delete(channel.id);
      this.newPublic();
    } catch (error) {
      Logger.error('fail on delete channel')
      console.log(error)
      this.emitError(socket, error)
    }
  }

  private emitError(socket: Socket, error: any) {
    this.server.to(socket.id).emit(ERROR, error)
  }

  private success(socket: Socket ) {
    this.server.to(socket.id).emit(SUCCESS, HttpStatus.OK)
  }

  @SubscribeMessage(KICK)
  async onKick(@ConnectedSocket() socket: Socket,
    @MessageBody() info: UpdateChannelDto)   {
    
    const user = socket.data.user;
    if (!user) {
        return this.noAccess(socket);
    } 
    try {
      const channel = await this.channelService.getChannel(info.cId, [
        'owner', 'admins', 'users', 'joinedUsers'
      ]);
      const u = await this.userService.getUserWith(info.uId, [
        'channels', 'joinedChannels']);
      if (!channel || !u) {
        return this.emitError(socket, new BadRequestException('No such channel or user')) 
      }
      if (channel.owner?.id === info.uId) {
        return this.emitError(socket, new BadRequestException('Can\'t kick the owner'))
      }
      if (!(channel.admins.some((admin) => admin.id === user.id))) {
        return this.emitError(socket, new BadRequestException('No rights')); 
      }
      // channel.admins = channel.admins.filter((admin) => admin.id !== u.id);
      channel.users = channel.users.filter((u) => u.id !== info.uId)
      channel.joinedUsers = channel.joinedUsers.filter(
        (jC) => jC.user.id !== u.id
      );
      u.channels = u.channels.filter((c) => c.id !== channel.id);
      u.joinedChannels = u.joinedChannels.filter(
        (jC) => jC.channel.id !== channel.id
      );
      await this.joinedChannelService.deleteByUserChannel(u, channel);
      await this.userService.saveUser(u);
      await this.channelService.saveChannel(channel);
      this.server.to(socket.id).emit(CHANNEL, this,this.channelToFe(channel));
      //Update kicked user's channels?
      const kicked = await this.chatUserService.findByUser(u);
      if (kicked) {
        const channels = (await this.channelService.getUsersChannels(u.id))
          .map((c) => this.channelToFe(c));
        this.server.to(kicked.socketId).emit(USER_CHANNELS, channels)
      }
    } catch (error) {
      this.emitError(socket, error);
    }
  }

  @SubscribeMessage(BAN)
  async onBan(@ConnectedSocket() socket: Socket,
    @MessageBody() info: UpdateChannelDto)   {
    
    const user = socket.data.user;
    console.log("ban sender", user)
    if (!user) {
        return this.noAccess(socket);
    } 
    try {
      const channel = await this.channelService.getChannel(info.cId, [
        'owner', 'users', 'admins', 'banned'
      ]);
      // console.log(channel);
      const u = await this.userService.getUserWith(info.uId, [
        'channels', 'adminAt', 'bannedAt'
      ]);
    //  console.log(u, channel); 
      if (!channel || !u) {
        return this.emitError(socket, new BadRequestException('No such channel or user')) 
      }
      if (channel.owner?.id === info.uId) {
        return this.emitError(socket, new BadRequestException('Can\'t ban the owner'))
      }
      if (!(channel.admins.some((admin) => admin.id === user.id))) {
        console.log('userId', user.id, 'admins', channel.admins)
        return this.emitError(socket, new BadRequestException('No rights')); 
      }
      if (channel.banned.some((banned) => banned.id === u.id))  {
        return this.emitError(socket, new BadRequestException('Already banned'))
      }
      channel.users = channel.users.filter((u) => u.id !== info.uId)
      channel.admins = channel.admins.filter((admin) => admin.id !== info.uId);
      channel.banned.push(u);
      u.channels = u.channels.filter((c) => c.id !== channel.id);
      u.adminAt = u.adminAt.filter((adminAt) => adminAt.id !== channel.id)

      // console.log(await this.userService.saveUser(u));
      // console.log(await this.channelService.saveChannel(channel));
      //TODO here
      console.log(await this.joinedChannelService.deleteByUserChannel(u, channel));
      this.server.to(socket.id).emit(CHANNEL, this.channelToFe(channel));
      const banned = await this.chatUserService.findByUser(u);
      if (banned) {
        const channels = (await this.channelService.getUsersChannels(u.id))
          .map((c) => this.channelToFe(c));
        this.server.to(banned.socketId).emit(USER_CHANNELS, channels)
      }
    } catch (error) {
      this.emitError(socket, error);
    }
  }

  @SubscribeMessage(UNBAN)
  async onUnban(@ConnectedSocket() socket: Socket,
    @MessageBody() info: UpdateChannelDto)   {
    
    const user = socket.data.user;
    if (!user) {
        return this.noAccess(socket);
    } 
    try {
      const channel = await this.channelService.getChannel(info.cId, [
        'owner', 'admins', 'banned'
      ]);
      const u = await this.userService.getUserWith(info.uId, [
        'bannedAt'
      ]);
      if (!channel || !u) {
        return this.emitError(socket, new BadRequestException('No such channel or user')) 
      }
      if (!(channel.admins.some((admin) => admin.id === user.id))) {
        return this.emitError(socket, new BadRequestException('No rights')); 
      }
      if (!(channel.banned.some((banned) => banned.id === info.uId)))  {
        return this.emitError(socket, new BadRequestException('Not banned'))
      }
      // channel.admins = channel.admins.filter((admin) => admin.id !== u.id);
      channel.banned = channel.banned.filter((u) => u.id !== info.uId)
      u.bannedAt = u.bannedAt.filter((c) => c.id !== info.cId)
      await this.userService.saveUser(u);
      await this.channelService.saveChannel(channel);
      this.server.to(socket.id).emit(CHANNEL, this.channelToFe(channel));
    } catch (error) {
      this.emitError(socket, error);
    }
  }

  @SubscribeMessage(MUTE)
  async onMute(@ConnectedSocket() socket: Socket,
    @MessageBody() info: UpdateChannelDto)   {
    
    const user = socket.data.user;
    console.log("mute sender", user)
    if (!user) {
        return this.noAccess(socket);
    } 
    try {
      const channel = await this.channelService.getChannel(info.cId, [
        'owner', 'admins'
      ]);
      console.log(channel);
      const u = await this.userService.getUserWith(info.uId, [
        'channels'
      ]);
    //  console.log(u, channel); 
      if (!channel || !u) {
        return this.emitError(socket, new BadRequestException('No such channel or user')) 
      }
      console.log(u.channels)
      if (!(u.channels.some((c) => c.id === channel.id))) {
        return this.emitError(socket, new BadRequestException('User not on channel'))
      }
      if (!(channel.admins.some((admin) => admin.id === user.id))) {
        console.log('userId', user.id, 'admins', channel.admins)
        return this.emitError(socket, new BadRequestException('No rights')); 
      }
      // console.log(channel.owner.id, u.id)
      if (channel.owner?.id === info.uId) {
        return this.emitError(socket, new BadRequestException('Can\'t mute the owner'))
      }
      console.log(await this.muteService.mute(u.id, channel.id));
      this.success(socket);
    } catch (error) {
      this.emitError(socket, error);
    }
  }

  @SubscribeMessage(ADD_ADMIN)
  async onAddAdmin(@ConnectedSocket() socket: Socket,
    @MessageBody() info: UpdateChannelDto)   {

    const user = socket.data.user;
    console.log('addAdmin', info);
    if (!user) {
      return this.noAccess(socket);
    } 
    try {
      const channel = await this.channelService.getChannel(info.cId, [
        'owner', 'admins'
      ]);
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
      this.server.to(socket.id).emit(CHANNEL, this.channelToFe(channel));
      this.success(socket);
    } catch (error) {
        console.log('catch error', error)
        return this.emitError(socket, error)
    }
  }
  @SubscribeMessage(REM_ADMIN)
  async onDelAdmin(@ConnectedSocket() socket: Socket,
    @MessageBody() info: UpdateChannelDto)   {

    const user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
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
      this.server.to(socket.id).emit(CHANNEL, this.channelToFe(channel));
    } catch (error) {
      this.emitError(socket, error);
    }
  }
  //TODO 
  async inviteToGame(user: User, userId: number, channelId: number)   {
     
  }

  @SubscribeMessage(INVITE_TO_PRIVATE)
  async onInviteToPriv(@ConnectedSocket() socket: Socket,
    @MessageBody() info: UpdateChannelDto)   {

    const user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    try {
      const u = await this.userService.getUserWith(info.uId, [
      ]);
      const channel = await this.channelService.getChannel(info.cId, [
        'users', 'invitedUsers', 'private'
      ]);
      if (!u || !channel) {
        throw new BadRequestException('No such channel or user')
      }
      if (!channel.private) {
        throw new BadRequestException('Channel not private')
      }
      if (channel.users.some((user) => user.id === u.id)) {
        throw new BadRequestException('Already on channel')
      }
      if (channel.invitedUsers.some((user) => user.id === u.id))  {
        throw new BadRequestException('Already invited')
      }
      channel.invitedUsers.push(u);
      await this.channelService.saveChannel(channel);
      this.success(socket);
      const chatUser = await this.chatUserService.findByUser(u);
      //TODO logic cnages later to invite being sent through direct
      if (chatUser) {
        const invitedTo = u.invitedTo.map((c) => this.channelToFe(c));
        this.server.to(socket.id).emit('invitesToPrivs', invitedTo);
      }
    } catch (error) {
      console.log(error);
      this.emitError(socket, error);
    }
  }
  @SubscribeMessage(DECLINE_PRIVATE_INVITE)
  async onDeclinePriv(@ConnectedSocket() socket: Socket,
    @MessageBody() info: cIdDto)   {

    const user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    try {
      const u = await this.userService.getUserWith(user.id, [
        'invitedTo'
      ]);
      const channel = await this.channelService.getChannel(info.cId, [
       'invitedUsers'
      ]);
      if (!u || !channel) {
        throw new BadRequestException('No such channel or user')
      }
      if (!(user.invitedTo.some((channel: Channel) => channel.id == info.cId))) {
        throw new BadRequestException('Not invited')
      }
      channel.invitedUsers = channel.invitedUsers.filter((user) => user.id !== u.id);
      u.invitedTo = u.invitedTo.filter((c) => c.id !== channel.id);
      await this.userService.saveUser(u);
      await this.channelService.saveChannel(channel);
      //SAME with changing logic
      this.onGetPrivInvites(socket);
    } catch (error) {
      console.log(error);
      this.emitError(socket, error);
    }
  }

  // might not be used
  @SubscribeMessage('getPrivInvites')
  async onGetPrivInvites(@ConnectedSocket() socket: Socket) {

    const user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    try {
      const u = await this.userService.getUserWith(user.id, [
        'invitedTo'
      ]);
      const invitedTo = u.invitedTo.map((c) => this.channelToFe(c));
      this.server.to(socket.id).emit('invitesToPrivs', invitedTo);
    } catch (error) {
      console.log(error);
      this.emitError(socket, error);
    }
  }

  @SubscribeMessage(PASSWORD)
  async onPassword(@ConnectedSocket() socket: Socket,
    @MessageBody() passInfo: ChannelPasswordDto)   {

    const user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    try {
      const channel = await this.channelService.getChannel(passInfo.cId, [
        'owner'
      ]) 
      console.log(channel);
      if (!channel) {
        throw new BadRequestException('No such channel');
      }
      if (user.id !== channel.owner?.id)  {
        throw new BadRequestException('No rights');
      }

      const c = await this.channelService.passwordService(passInfo);
      //to update 'protected' property
      this.newPublic();
      this.success(socket);
    } catch (error) {
      this.emitError(socket, error)
    }
  }

  @SubscribeMessage(DIRECT)
  async onPriv(@ConnectedSocket() socket: Socket,
  @MessageBody() uInfo: PrivMsgDto)  {
    
    const user = socket.data.user;
    console.log(uInfo)
    if (!user) {
      return this.noAccess(socket);
    }
    try {
      const u = await this.userService.getUserWith(uInfo.uId,[
        'blockedUsers'
      ]);
      if (!u)  {
        throw new BadRequestException('No such user');
      }
      if (user.id === u.id) {
        throw new BadRequestException("No talking to yourself");
      }
      if (u.blockedUsers.some((blocked) => blocked.id === u.id)) {
        throw new BadRequestException('User has blocked you')
      }
      const exists = await this.channelService.getPrivate(user, u);
      let room: Channel;
      console.log(exists);
      if (!exists.length) {
        room =  await this.channelService.createPrivate(user, u);
        console.log(room);
        await this.joinedChannelService.create(user, socket.id, room);
        const chatUser = await this.chatUserService.findByUser(u);
        if (chatUser) {
          await this.joinedChannelService.create(u, chatUser.socketId, room);
        }
      } else  {
        room = exists[0];
      }
      //emit user channels to both
      this.onGetUsersChannels(socket);
      const adresant = await this.chatUserService.findByUser(u);
      if (adresant) {
        const hisChannels = (await this.channelService.getUsersChannels(u.id))
          .map((c) => this.channelToFe(c));
          this.server.to(adresant.socketId).emit(USER_CHANNELS, hisChannels)
      }

      this.onMessage(socket, {cId: room.id, content: uInfo.text});
    } catch (error) {
      console.log(error);
      this.emitError(socket, error)
    }
  }

  @SubscribeMessage(BLOCK)
  async onBlock(@ConnectedSocket() socket: Socket,
    @MessageBody() userInfo: uIdDto) {

    const user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    try {
      if (user.id === userInfo.uId) {
        throw new BadRequestException('Can\'t block self')
      }
      console.log(await this.userService.blockUser(user.id, userInfo.uId));
      // or whatever user 
      this.success(socket);
    } catch (error) {
      console.log(error);
      this.emitError(socket, error)
    }
  }

  @SubscribeMessage(UNBLOCK)
  async onUnBlock(@ConnectedSocket() socket: Socket,
    @MessageBody() userInfo: uIdDto) {
    const user = socket.data.user;

    if (!user) {
      return this.noAccess(socket);
    }
    try {
      await this.userService.unBlockUser(user.id, userInfo.uId);
      this.success(socket);
    } catch (error) {
      console.log(error);
      this.emitError(socket, error)
    }
  }

  @SubscribeMessage(CHANNEL_USERS)
  async onGetChannelUsers(@ConnectedSocket() socket: Socket,
    @MessageBody() channelInfo: cIdDto)  {

    const user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    } 
    try {
      const channel = await this.channelService.getChannel(channelInfo.cId, [
        'users'
      ]);
      if (!channel)  {
        throw new BadRequestException("No such channel");
      }
      this.server.to(socket.id).emit(CHANNEL_USERS, channel.users)
    } catch (error) {
      console.log(error);
      this.emitError(socket, error);
    }
  }

  private channelToFe(channel: Channel): ChannelToFeDto{
    return {
      id: channel.id,
      name: channel.name,
      private: channel.private,
      users: channel.users,
      protected: channel.protected,
      type: channel.type,
      updatedAt: channel.updatedAt
     }
  }

  @SubscribeMessage(CHANNEL)
  async onGetChannel(@ConnectedSocket() socket: Socket,
    @MessageBody() channelInfo: cIdDto) {

    const user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    try {
      const channel = await this.channelService.getChannel(channelInfo.cId, [
        'users'
      ]);
      this.server.to(socket.id).emit(CHANNEL, this.channelToFe(channel));
    } catch (error) {
      console.log(error);
      this.emitError(socket, error)
    }
  }
} 