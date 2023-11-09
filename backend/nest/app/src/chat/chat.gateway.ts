import { BadRequestException, HttpStatus, Logger, OnModuleInit, UnauthorizedException, UsePipes, ValidationPipe } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChannelService } from './service/channel.service';
import { ChannelPasswordDto, ChannelToFeDto, CreateChannelDto, JoinChannelDto, PrivMsgDto, PrivateInviteDto, UpdateChannelDto, cIdDto, uIdDto } from './dto/channel.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/service/user.service';
import { ChatUserService } from './service/chat-user.service';
import { JoinedChannelService } from './service/joined-channel.service';
import { MessageService } from './service/message.service';
import { CreateMessageDto } from './dto/channel.dto';
import { JoinedChannel } from './entities/joinedChannel.entity';
import { MuteService } from './service/mute.service';
import { Channel } from './entities/channel.entity';
import { Message } from './entities/message.entity';
import { ACCEPT_PRIVATE_INVITE, ADD_ADMIN, BAN, BLOCK, CHANNEL, CHANNELS, CHANNEL_MESSAGES, CHANNEL_USERS, CREATE, DECLINE_PRIVATE_INVITE, DELETE, DIRECT, ERROR, INVALIDATE_MESSAGE_CONTENT, INVITE_TO_PRIVATE, JOIN, KICK, LEAVE, MESSAGE, MUTE, PASSWORD, REM_ADMIN, SUCCESS, UNBAN, UNBLOCK, USER_CHANNELS } from './subscriptions-events-constants';
import { CHANNEL_NAME_REGEX, SAFE_PASSWORD_REGEX } from 'src/Constants';

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
      await this.messageService.purge();
      await this.channelService.purge();
    }

  async handleConnection(@ConnectedSocket() socket: Socket) {

    Logger.log(`New CHAT connection: ${socket.id}`);
    console.log(socket.handshake.headers)

    let user = socket.request['user'];
    if (!user)  {
      Logger.error('Anonymous connection')
      return this.noAccess(socket);
    }  else  {
      socket.data.user = user;
      try {
        await this.chatUserService.create(user, socket.id);
        user = await this.userService.getUserWith(user.id, [
          'channels'
        ]);
        if (user.channels) {
          for (const channel of user.channels) {
            const jC = await this.joinedChannelService.findByChannelUser(channel, user);
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

  async handleDisconnect(socket: Socket) {

    Logger.log(`Client disconnected ${socket.id}`)
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
    Logger.debug(`at CREATE  ${channelInfo.name}`)
    console.log(channelInfo)
    try {
      if (!CHANNEL_NAME_REGEX.test(channelInfo.name)) {
        throw new BadRequestException('Bad channel name format')
      }
      if (channelInfo.type === 'protected') {
        if (!channelInfo.password || channelInfo.password.length < 1) {
          throw new BadRequestException('No password provided')
        }
        if (!SAFE_PASSWORD_REGEX.test(channelInfo.password))  {
          throw new BadRequestException('Password not safe!')
        }
      }
      const channel = await this.channelService.createChannel(channelInfo, user);
      await this.joinedChannelService.create(user, socket.id, channel);
      this.success(socket, `${channel.name} created`)
      this.onGetUsersChannels(socket);
      if (channel.type !== 'private') {
        this.newPublic();
      }
    } catch  (error)  {
        Logger.error(error);
        this.server.to(socket.id).emit('error', error)
    }
  }

  private async newPublic() {
    const publicChannels/*: ChannelToFeDto[]*/ = (await this.channelService.getAllChannels())
          .filter((c) => !c.private)
          // .map((c) => this.channelToFe(c));
    const onlineUsers = await this.chatUserService.getAll();
    for (const onlineUser of onlineUsers) {
      this.server.to(onlineUser.socketId).emit(
        CHANNELS, publicChannels
        .filter((c) => {
          if (!(c.users.some((u) => u.id === onlineUser.user.id))) {
            return c;
          }
        })
        .filter((c) => {
          if (!(c.banned.some((banned) => banned.id === onlineUser.user.id))) {
            return c
          }
        })
        .map((c) => this.channelToFe(c))
      )
  }
}
  
  private async emitToChatUsers(event: string, criteria: User[] | null, info: any/*User[] | Channel[]*/) {
    console.log(criteria);
    console.log(info)
    const chatUsers = await this.chatUserService.getAll();
    if (!criteria)  {
      for (const chatUser of chatUsers) {
        this.server.to(chatUser.socketId).emit(event, info)
      }
    } else  {
      for (const chatUser of chatUsers)  {
        if (criteria.some((u) => u.id === chatUser.user.id))  {
          console.log('emiting', info,  'to:', chatUser.user.username);
          this.server.to(chatUser.socketId).emit(event, info)
        }
      }
    }
  }

  @SubscribeMessage(JOIN)
  async onJoin(@ConnectedSocket() socket: Socket,
    @MessageBody() joinInfo: JoinChannelDto) {

    let user = socket.data.user;
    if (!user) {
      return this.emitError(socket, 'No Access');
    }
    Logger.debug('at JOIN')
    console.log(joinInfo);
    try {
      const channel: Channel = await this.channelService.join(user, joinInfo);
      if (channel.private)  {
        user = await this.userService.getUserWith(user.id, [
          'invitedTo'
        ]);
        user.invitedTo = user.invitedTo.filter((c: Channel) => c.id !== channel.id);
        await this.userService.saveUser(user);
      }
      await this.joinedChannelService.create(user, socket.id, channel);
      this.onGetUsersChannels(socket);
      this.onGetAllChannels(socket);
      const usersWithChatRelations = await this.usersWithChatRelations(channel.users)
      this.emitToChatUsers(CHANNEL_USERS, channel.users, {
        cId: channel.id,
        users: usersWithChatRelations
      });
      return ;

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
    Logger.debug('at LEAVE')
    console.log(channelInfo)
    try {
      const channel = await this.channelService.getChannel(channelInfo.cId, [
        'owner', 'users', 'admins'
      ])
      if (!channel) {
        return this.emitError(socket, new BadRequestException('No such channel'))
      }
      // console.log(channel);
    //delete channel if owner leaves
      if (channel.type === 'direct')  {
        throw new BadRequestException('NO LEAVING FOR DIRECT MESSAGING!\n Hide the button')
      }
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
      // console.log('afterfilter', channel);
      await this.joinedChannelService.deleteBySocketId(socket.id, channel);
      //not possile but still
      if (channel.users.length === 0) {
        this.onDelete(socket, channelInfo);
      }
      //emit user's channels
      this.onGetUsersChannels(socket);
    } catch (error) {
      console.log(error);
      this.emitError(socket, error)
    }
  }

  // async typing(
  //   @MessageBody('isTyping') isTyping: boolean)  {

  // }

  @SubscribeMessage(CHANNEL_MESSAGES)
  async onGetChannelMessages(@ConnectedSocket() socket: Socket,
    @MessageBody() channelInfo: cIdDto)  {

    let user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    Logger.debug('at CHANNEL_MESSAGES')
    console.log(cIdDto);
    try {
      const channel = await this.channelService.getChannel(channelInfo.cId, [
        'users'
      ]);
      if (!channel) {
        throw new BadRequestException('No such channel');
      }
      if (!(channel.users.some((u) => u.id === user.id))) {
        throw new BadRequestException('User not on the channel')
      }
      user = await this.userService.getUserWith(user.id, [
        'blockedUsers'
      ]);
      let messages = await this.messageService.findMessagesForChannel(channel);
      for (const blockedUser of user.blockedUsers) {
        console.log(blockedUser);
        messages = messages.filter((msg: Message) => msg.user.id !== blockedUser.id);
      }
    // console.log('messages with blocked user messages filtered', messages);
      messages = messages.sort((m1, m2) => m1.createdAt.getTime() - m2.createdAt.getTime())
      // .filter((msg) => msg.user !== null);
      const msgsToFe = messages.map((m) =>  {
      // console.log(user, m.user);
        if (user.id === m.user.id)  {
          m['sessionUser'] = true
        } else  {
          m['sessionUser'] = false
        }
        return m;
      })
      this.server.to(socket.id).emit(CHANNEL_MESSAGES, msgsToFe);
    } catch (error) {
      console.log(error);
      this.emitError(socket, error);
    }
  }

  @SubscribeMessage(MESSAGE)
  async onMessage(socket: Socket, message: CreateMessageDto) {

    let user: User = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    Logger.debug('at MESSAGE')
    console.log(message);
    try {
      const channel = await this.channelService.getChannel(message.cId, [
        'users'
      ]);
      if (!channel) {
        throw new BadRequestException('No such channel')
      }
      if (!(channel.users.some((u) => u.id === user.id))) {
        throw new BadRequestException('User not on the channel')
      }
      if (channel.type === 'direct')  {
        user = await this.userService.getUserWith(user.id, [
          'blockedUsers'
        ]);
        for (const interlocutor of channel.users) {
          if (!(interlocutor.id === user.id))  {
            const u = await this.userService.getUserWith(interlocutor.id, [
              'blockedUsers'
            ]);
            if (u.blockedUsers.some((blocked) => blocked.id === user.id ))  {
              throw new BadRequestException('User blocked you')
            }
          } else  {
            if (user.blockedUsers.some((blocked) => blocked.id === interlocutor.id))  {
              throw new BadRequestException('You\'re blocking the user')
            }
          }
        }
      }
      if (channel.type !== 'direct')  {
        const isMuted = await this.muteService.getMute(user.id, channel.id);
        if (isMuted)  {
          // console.log(isMuted.mutedUntil.getTime(), new Date().getTime())
          if (isMuted.mutedUntil.getTime() > new Date().getTime() )  {
            return this.emitError(socket, new BadRequestException('You\'re muted'));
          } else  {
            await this.muteService.deleteMute(isMuted.id);
          }
        }
      }
      const newMsg = await this.messageService.newMessage(channel, user,  message);
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
    
      let user = socket.data.user;
      if (!user) {
        return this.noAccess(socket);
      }
    Logger.debug('at CHANNELS')
    try {
      const channels = await  this.channelService.getAllChannels();
      // console.log(channels)
      user = await this.userService.getUserWith(user.id, [
        'bannedAt'
      ])
      const cToFe = channels.filter((c) => !(c.private)).map((c) => this.channelToFe(c))
        .filter((c) => !(user.bannedAt.some((bannedAt: Channel) => bannedAt.id === c.id)))
        .sort((c1, c2) => c1.updatedAt.getDate() - c2.updatedAt.getDate())
        .filter((c) => {
          if (!(c.users.some((u) => u.id === user.id))) {
            return c;
          }
        });
      // console.log(cToFe)
      this.server.to(socket.id).emit(CHANNELS, cToFe);
    } catch (error) {
      console.log(error);
      return this.emitError(socket, error)
    }
  }

  @SubscribeMessage(USER_CHANNELS)
  async onGetUsersChannels(@ConnectedSocket() socket: Socket) {

    let user: User = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    Logger.debug('at USER_CHANNELS')
    try {
      const channels = await this.channelService.getUsersChannels(user.id)
      user = await this.userService.getUserWith(user.id, [
        'blockedUsers', 'bannedAt'
      ]);
      // console.log(user)
      const cToFe = this.userChannelsToFe(user, channels);  
      // console.log('owner und stf should be there', cToFe)
      this.server.to(socket.id).emit(USER_CHANNELS, cToFe);
    } catch (error) {
      console.log(error);
        /*return*/ this.emitError(socket, error)
    }
  }

  private userChannelsToFe(user: User, channels: Channel[]): ChannelToFeDto[] {
    const cToFe: ChannelToFeDto[] = channels
          .filter((c) => {
            if (c.type === 'direct')  {
              for (const u of c.users)  {
                if (u.id !== user.id) {
                  if (!(user.blockedUsers.some((blocked) => blocked.id === u.id)))  {
                    return c;
                  }
                }
              }
            } else  {
              return c;
            }
          })
          // .filter((c) => !(user.bannedAt.some((bannedAt) => bannedAt.id === c.id)))
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
          });
    return cToFe;
  }

  //TODO ok this is big, still needs doubletriplecheck
  @SubscribeMessage(DELETE) 
  async onDelete(@ConnectedSocket() socket: Socket,
    @MessageBody() cId: cIdDto)  {

    const user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    Logger.debug(`at DELETE ${cId.cId}`)
    try {
      const channel = await this.channelService.getChannel(cId.cId, [
        'owner', 'users', 'messages.user', 'admins', 'joinedUsers', 'messages',
        'messages.user.messages', 'banned', 'invitedUsers'
      ]);
      if (!channel) {
        return this.emitError(socket, 'No such channel');
      }
      console.log('CHANNEL TO DELETE', channel);
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
          }
      }
      await Promise.all(channel.messages.map(async (message) => {
        console.log(message.user.messages)
        await this.userService.saveUser(message.user)
      }))
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
      if (channel.private)  {
        for (const invited of channel.invitedUsers)  {
          const user = await this.userService.getUserWith(invited.id, [
            'invitedTo'
          ]);
          user.invitedTo = user.invitedTo.filter((c) => c.id !== channel.id);
          await this.userService.saveUser(user);
        }
      }
      //Updating channel lists for FE
      const chatUsers = await this.chatUserService.getAll();
/*      const cToFe = ((await this.channelService.getAllChannels()))
            .map((c) => this.channelToFe(c))
            .filter((c) => !c.private);*/
      for (const chatUser of chatUsers) {
        // this.server.to(chatUser.socketId).emit(CHANNELS, cToFe);
        if (channel.users.some((u) => chatUser.user.id === u.id)) {
          const userWithBlocked = await this.userService.getUserWith(chatUser.user.id, [
            'blockedUsers', 'bannedAt'
          ]);
          const cToFe = this.userChannelsToFe(userWithBlocked, (await this.channelService.getUsersChannels(chatUser.user.id)));
          // const cToFe = (await this.channelService.getUsersChannels(chatUser.user.id))
                // .map((c) => this.channelToFe(c));
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

  private success(socket: Socket, info: any) {
    // this.server.to(socket.id).emit(SUCCESS, HttpStatus.OK)
    this.server.to(socket.id).emit(SUCCESS, info)
  }

  @SubscribeMessage(KICK)
  async onKick(@ConnectedSocket() socket: Socket,
    @MessageBody() info: UpdateChannelDto)   {
    
    const user = socket.data.user;
    if (!user) {
        return this.noAccess(socket);
    } 
    Logger.debug(`on KICK  ${info.uId} from ${info.cId}`);
    try {
      const channel = await this.channelService.getChannel(info.cId, [
        'owner', 'admins', 'users', 'joinedUsers'
      ]);
      let u = await this.userService.getUserWith(info.uId, [
        'channels', 'joinedChannels'
      ]);
      if (!channel || !u) {
        throw new BadRequestException('No such channel or user')
      }
      if (channel.owner?.id === info.uId) {
        throw new BadRequestException('Can\'t kick the owner')
      }
      if (!(channel.admins.some((admin) => admin.id === user.id))) {
        throw new BadRequestException('No rights')
      }
      channel.users = channel.users.filter((u) => u.id !== info.uId)
      u.channels = u.channels.filter((c) => c.id !== channel.id);
      /*
      ** all this bs solved with cascade..
      const jCs = u.joinedChannels;
      const jUs = channel.joinedUsers;
      console.log(jCs, jUs)
      channel.joinedUsers = channel.joinedUsers.filter((jU) => !(jCs.some((jC) => jC.id === jU.id)))
      u.joinedChannels = u.joinedChannels.filter((jC) => !(jUs.some((jU) => jU.id === jC.id)))
      */
      await this.joinedChannelService.deleteByUserChannel(u, channel);
      await this.userService.saveUser(u);
      await this.channelService.saveChannel(channel);
      this.onGetChannelUsers(socket, {cId: info.cId})
      this.success(socket, `${u.username} kicked out`)
      //Update kicked user's channels?
      const kicked = await this.chatUserService.findByUser(u);
      if (kicked) {
        u = await this.userService.getUserWith(u.id, [
          'blockedUsers', 'bannedAt'
        ]);
        const channels = await this.channelService.getUsersChannels(u.id);
        const cToFe = this.userChannelsToFe(u, channels);
        this.server.to(kicked.socketId).emit(USER_CHANNELS, cToFe)
      }
    } catch (error) {
      this.emitError(socket, error);
    }
  }

  @SubscribeMessage(BAN)
  async onBan(@ConnectedSocket() socket: Socket,
    @MessageBody() info: UpdateChannelDto)   {
    
    const user = socket.data.user;
    Logger.debug(`at BAN`)
    console.log("ban sender", user)
    if (!user) {
        return this.noAccess(socket);
    } 
    try {
      const channel = await this.channelService.getChannel(info.cId, [
        'owner', 'users', 'admins', 'banned', 'joinedUsers'
      ]);
      // console.log(channel);
      let u = await this.userService.getUserWith(info.uId, [
        'channels', 'adminAt', 'bannedAt', 'joinedChannels'
      ]);
      if (!channel || !u) {
        throw new BadRequestException('No such channel or user');
      }
      if (channel.owner?.id === info.uId) {
        throw new BadRequestException('Can\'t ban the owner');
      }
      if (!(channel.admins.some((admin) => admin.id === user.id))) {
        console.log('userId', user.id, 'admins', channel.admins)
        throw new BadRequestException('No rights');
      }
      if (channel.banned.some((banned) => banned.id === u.id))  {
        throw new BadRequestException('Already banned');
      }
      channel.users = channel.users.filter((u) => u.id !== info.uId)
      channel.admins = channel.admins.filter((admin) => admin.id !== info.uId);
      channel.banned.push(u);
      u.channels = u.channels.filter((c) => c.id !== channel.id);
      u.adminAt = u.adminAt.filter((adminAt) => adminAt.id !== channel.id)
      await this.userService.saveUser(u);
      u = await this.userService.getUserWith(u.id, [
        'blockedUsers', 'bannedAt'/*, 'joinedChannels'*/
      ])
      await this.channelService.saveChannel(channel);
      await this.joinedChannelService.deleteByUserChannel(u, channel)
      this.server.to(socket.id).emit(CHANNEL, this.channelToFe(channel));
      this.onGetChannelUsers(socket, {cId: channel.id});
      const banned = await this.chatUserService.findByUser(u);
      if (banned) {
        const channels = (await this.channelService.getUsersChannels(u.id))
          // .map((c) => this.channelToFe(c));
        this.server.to(banned.socketId).emit(USER_CHANNELS, this.userChannelsToFe(u, channels));
        this.success(socket, `${u.username} banned from ${channel.name} `)
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
    Logger.debug(`at UNBAN`)
    try {
      const channel = await this.channelService.getChannel(info.cId, [
        'owner', 'admins', 'banned'
      ]);
      const u = await this.userService.getUserWith(info.uId, [
        'bannedAt'
      ]);
      if (!channel || !u) {
        throw new BadRequestException('No such channel or user');
      }
      if (!(channel.admins.some((admin) => admin.id === user.id))) {
        throw new BadRequestException('No rights');
      }
      if (!(channel.banned.some((banned) => banned.id === info.uId)))  {
        throw new BadRequestException('Not banned');
      }
      channel.banned = channel.banned.filter((u) => u.id !== info.uId)
      u.bannedAt = u.bannedAt.filter((c) => c.id !== info.cId)
      await this.userService.saveUser(u);
      await this.channelService.saveChannel(channel);
      this.server.to(socket.id).emit(CHANNEL, this.channelToFe(channel));
      this.success(socket, `${u.username} unbanned from ${channel.name}`)
    } catch (error) {
      this.emitError(socket, error);
    }
  }

  @SubscribeMessage(MUTE)
  async onMute(@ConnectedSocket() socket: Socket,
    @MessageBody() info: UpdateChannelDto)   {
    
    const user = socket.data.user;
    Logger.debug(`at MUTE`)
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
        throw new BadRequestException('No such channel or user');
      }
      console.log(u.channels)
      if (!(channel.admins.some((admin) => admin.id === user.id))) {
        console.log('userId', user.id, 'admins', channel.admins)
        throw new BadRequestException('No rights');
      }
      if (!(u.channels.some((c) => c.id === channel.id))) {
        throw new BadRequestException('User not on channel');
      }
      if (channel.owner?.id === info.uId) {
        return this.emitError(socket, new BadRequestException('Can\'t mute the owner'))
      }
      console.log(await this.muteService.mute(u.id, channel.id));
      this.success(socket, `${u.username} muted`);
    } catch (error) {
      this.emitError(socket, error);
    }
  }

  @SubscribeMessage(ADD_ADMIN)
  async onAddAdmin(@ConnectedSocket() socket: Socket,
    @MessageBody() info: UpdateChannelDto)   {

    const user = socket.data.user;
    Logger.debug(`at AD_ADMIN`);
    if (!user) {
      return this.noAccess(socket);
    } 
    try {
      const channel = await this.channelService.getChannel(info.cId, [
        'owner', 'admins', 'users'
      ]);
      let u = await this.userService.findUserById(info.uId);
      if (!u || !channel) {
        return this.emitError(socket, new BadRequestException('No such channel or user'))
      }
      if (channel?.owner?.id !== user.id) {
        throw new BadRequestException('No rights');
      }
      console.log(u)
      if (!(channel.users.some((someone) => someone.id === u.id))){
        throw new BadRequestException('User not on the channel');
      }
      if (channel.admins.some((admin)=> admin.id === info.uId)) {
        console.log(`already in`)
        throw new BadRequestException('Already an admin');
      }
      channel.admins.push(u);
      await this.channelService.saveChannel(channel);
      console.log(channel)
      // u = await this.userService.getUserWith(u.id, ['adminAt']);
      // console.log(u)
      this.server.to(socket.id).emit(CHANNEL, this.channelToFe(channel));
      this.success(socket, `${u.username} set as admin`);
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
    Logger.debug(`at REM_ADMIN`)
    // console.log(user, info)
    try {
      const channel = await this.channelService.getChannel(info.cId, [
        'owner', 'admins'
      ]);
      // console.log(channel)
      const u = await this.userService.getUserWith(info.uId, ['adminAt']);
      // console.log(u);
      if (!channel || !u) {
        throw new BadRequestException('No such channel or user');
      }
      if (channel.owner?.id !== user.id)  {
        throw new BadRequestException('No rights');
      }
      if (channel.owner?.id === u.id)  {
        throw new BadRequestException('Can\'t remove self');
      }
      channel.admins = channel.admins.filter((admin) => admin.id !== u.id);
      u.adminAt = u.adminAt.filter((c) => c.id !== channel.id);
      await this.userService.saveUser(u);
      /*console.log*/(await this.channelService.saveChannel(channel));
      this.server.to(socket.id).emit(CHANNEL, this.channelToFe(channel));
      this.success(socket, `${u.username} removed from adminlist`)
    } catch (error) {
      console.log(error)
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
    Logger.debug(`at INVITE_TO_PRIVATE`)
    try {
      const u = await this.userService.getUserWith(info.uId, [
      ]);
      const channel = await this.channelService.getChannel(info.cId, [
        'users', 'invitedUsers'
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
      this.success(socket, ` ${u.username} invited to ${channel.name}`);
      /*
      const chatUser = await this.chatUserService.findByUser(u);
      if (chatUser) {
        const invitedTo = u.invitedTo.map((c) => this.channelToFe(c));
        this.server.to(socket.id).emit('invitesToPrivs', invitedTo);
      }
      */
    } catch (error) {
      console.log(error);
      this.emitError(socket, error);
    }
  }

  @SubscribeMessage(ACCEPT_PRIVATE_INVITE)
  async onAcceptPriv(@ConnectedSocket() socket: Socket,
    @MessageBody() info: PrivateInviteDto)   {

    const user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    Logger.debug(`at ACCEPT_PRIVATE_INVITE`)
    try {
      await this.onJoin(socket, { id: info.cId })
      const msg = await this.invalidateMsgContent(info.msgId);
      if (msg)  {
        // this.success(socket, `Accepted the invite`)
        this.onGetChannelMessages(socket, {cId: msg.channel.id})
      }
      // this.onGetPrivInvites(socket);
    } catch (error) {
      console.log(error);
      this.emitError(socket, error);
    }
  }

  private async invalidateMsgContent(msgId: number): Promise<Message> {
    const msg = await this.messageService.findById(msgId);
    if (msg)  {
      msg.content = '*Content no longer available*';
        msg.inviteId = null;
        msg.inviteType = null;
        console.log(msg);
        return await this.messageService.save(msg);
    }
    return ;
  }

  @SubscribeMessage(DECLINE_PRIVATE_INVITE)
  async onDeclinePriv(@ConnectedSocket() socket: Socket,
    @MessageBody() info: PrivateInviteDto)   {

    const user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    Logger.debug(`DECLINE_PRIVATE_INVITE`)
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
      if (!(u.invitedTo.some((channel: Channel) => channel.id == info.cId))) {
        throw new BadRequestException('Not invited')
      }
      channel.invitedUsers = channel.invitedUsers.filter((user) => user.id !== u.id);
      u.invitedTo = u.invitedTo.filter((c) => c.id !== channel.id);
      await this.userService.saveUser(u);
      await this.channelService.saveChannel(channel);
      const msg = await this.invalidateMsgContent(info.msgId);
      if (msg)  {
        this.success(socket, `declined the invite`)
        this.onGetChannelMessages(socket, {cId: msg.channel.id})
      }
      //SAME with changing logic
      // this.onGetPrivInvites(socket);
    } catch (error) {
      console.log(error);
      this.emitError(socket, error);
    }
  }

  // Unused
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
    Logger.debug(`at PASSWORD`)
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
      this.success(socket, `Password updated`);
    } catch (error) {
      Logger.error(`${error}`)
      this.emitError(socket, error)
    }
  }

  @SubscribeMessage(DIRECT)
  async onPriv(@ConnectedSocket() socket: Socket,
  @MessageBody() info: PrivMsgDto)  {
    
    let user = socket.data.user;
    Logger.debug(`at DIRECT`)
    console.log(info)
    if (!user) {
      return this.noAccess(socket);
    }
    try {
      const u = await this.userService.getUserWith(info.uId,[
        'blockedUsers'
      ]);
      if (!u)  {
        throw new BadRequestException('No such user');
      }
      if (user.id === u.id) {
        throw new BadRequestException("No talking to yourself");
      }
      if (u.blockedUsers.some((blocked) => blocked.id === user.id)) {
        throw new BadRequestException('User has blocked you')
      }
      user = await this.userService.getUserWith(user.id, [
        'blockedUsers'
      ]); 
      if (user.blockedUsers.some((blocked: User) => blocked.id === u.id )) {
        throw new BadRequestException('You\'re blocking the user')
      }
      if (info.inviteType) {
        if (!info.inviteId) {
            throw new BadRequestException('Missing info')
        }
        if (info.inviteType  === 'channel')  {
          const channel = await this.channelService.getChannel(Number(info.inviteId), [
          'users', 'invitedUsers'
        ]);
        if (!channel) {
          throw new BadRequestException('No such channel')
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
        this.success(socket, ` ${u.username} invited to ${channel.name}`);
      } else if (info.inviteType === 'game') {
          Logger.debug(`Received game invite type message`)
          //TODO game invite logic
      } else  {
          throw new BadRequestException('Wtf, go away')
      }
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
          .map((c) => this.channelToFe(c))
          .map((c) => {
            if (c.name) {
              return c
            } else  {
              for (const u of c.users)  {
                if (u.id === user.id) {
                  c.name = u.username;
                  c.avatar = u.avatar
                }
              }
              return c
            }
          }
        );
        this.server.to(adresant.socketId).emit(USER_CHANNELS, hisChannels)
      }

      const msg: CreateMessageDto = {
        cId: room.id,
        content: info.text
      }
      if (info.inviteType)  {
        msg.inviteType = info.inviteType;
        msg.inviteId = String(info.inviteId);
      }
      this.onMessage(socket, msg);
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
    Logger.debug(`at BLOCK`)
    try {
      if (user.id === userInfo.uId) {
        throw new BadRequestException('Can\'t block self')
      }
      /*console.log*/ const u = (await this.userService.blockUser(user.id, userInfo.uId));
      this.success(socket, `${u?.username} blocked`);
      this.onGetUsersChannels(socket);
    } catch (error) {
      console.log(error);
      this.emitError(socket, error)
    }
  }

  @SubscribeMessage(UNBLOCK)
  async onUnBlock(@ConnectedSocket() socket: Socket,
    @MessageBody() userInfo: uIdDto) {

    const user = socket.data.user;
    Logger.debug(`at UNBLOCK`)
    if (!user) {
      return this.noAccess(socket);
    }
    try {
      const u = await this.userService.unBlockUser(user.id, userInfo.uId);
      this.success(socket, `${u?.username} unblocked`);
      this.onGetUsersChannels(socket);
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
    Logger.debug('at CHANNEL_USERS')
    try {
      const channel = await this.channelService.getChannel(channelInfo.cId, [
        'users'
      ]);
      if (!channel)  {
        throw new BadRequestException("No such channel");
      }
      const usersWithChatRelations = await this.usersWithChatRelations(channel.users);
      // console.log(channel.users, 'AND NOW WITH RELATIONS', usersWithChatRelations);
      this.server.to(socket.id).emit(CHANNEL_USERS, {
        cId: channel.id,
        users: usersWithChatRelations
      })
      return ;
    } catch (error) {
      console.log(error);
      this.emitError(socket, error);
    }
  }

  private async usersWithChatRelations(users: User[]): Promise<User[]>  {
    return Promise.all(users.map(async (user: User) => {
      return await this.userService.getUserWith(user.id, [
        /*'adminAt',*/ 'bannedAt', 'blockedUsers'
      ])
    }))
  }

  private channelToFe(channel: Channel): ChannelToFeDto{
    const chanToFe: ChannelToFeDto = {
      id: channel.id,
      name: channel.name,
      private: channel.private,
      users: channel.users,
      protected: channel.protected,
      type: channel.type,
      updatedAt: channel.updatedAt,
     }
     if (channel.owner) {
      chanToFe.owner = channel.owner
     }
     if (channel.admins)  {
      chanToFe.admins = channel.admins
     }
     return chanToFe;
  }

  @SubscribeMessage(CHANNEL)
  async onGetChannel(@ConnectedSocket() socket: Socket,
    @MessageBody() channelInfo: cIdDto) {

    const user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    Logger.debug(`at CHANNEL`)
    try {
      const channel = await this.channelService.getChannel(channelInfo.cId, [
        'users', 'admins', 'banned'
      ]);
      this.server.to(socket.id).emit(CHANNEL, this.channelToFe(channel));
    } catch (error) {
      console.log(error);
      this.emitError(socket, error)
    }
  }

  @SubscribeMessage(INVALIDATE_MESSAGE_CONTENT)
  async onInvalidateMessageContent(@ConnectedSocket() socket: Socket,
    @MessageBody() msgInfo: cIdDto) {

      const user = socket.data.user;
      if (!user) {
        return this.noAccess(socket);
      } 
      try {
        Logger.debug(`INVALIDATE_MESSAGE_CONTENT`);
        const msg = await this.invalidateMsgContent(msgInfo.cId);
        if (msg)  {
          this.onGetChannelMessages(socket, {cId: msg.channel.id})
        }
      } catch (error) {
        console.log(error);
        this.emitError(socket, error) 
      }
    }
} 