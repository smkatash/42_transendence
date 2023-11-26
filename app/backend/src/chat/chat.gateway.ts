import { BadRequestException, HttpStatus, Logger, OnModuleInit, UnauthorizedException, UsePipes, ValidationPipe } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { User } from "src/user/entities/user.entity";
import { UserService } from "src/user/service/user.service";
import { CHANNEL_NAME_REGEX, SAFE_PASSWORD_REGEX } from "src/utils/Constants";
import { ChannelPasswordDto, ChannelToFeDto, CreateChannelDto, CreateMessageDto, JoinChannelDto, PrivMsgDto, PrivateInviteDto, UpdateChannelDto, cIdDto, uIdDto } from "./dto/channel.dto";
import { Channel } from "./entities/channel.entity";
import { JoinedChannel } from "./entities/joinedChannel.entity";
import { Message } from "./entities/message.entity";
import { ChannelService } from "./service/channel.service";
import { ChatUserService } from "./service/chat-user.service";
import { JoinedChannelService } from "./service/joined-channel.service";
import { MessageService } from "./service/message.service";
import { MuteService } from "./service/mute.service";
import {
  ACCEPT_PRIVATE_INVITE,
  ACHTUNG,
  ADD_ADMIN,
  BAN,
  BLOCK,
  BLOCKED_USERS,
  CHANNEL,
  CHANNELS,
  CHANNEL_MESSAGES,
  CHANNEL_USERS,
  CREATE,
  DECLINE_PRIVATE_INVITE,
  DELETE,
  DIRECT,
  ERROR,
  INVALIDATE_MESSAGE_CONTENT,
  INVITE_TO_PRIVATE,
  JOIN,
  KICK,
  LEAVE,
  MESSAGE,
  MUTE,
  PASSWORD,
  REM_ADMIN,
  SUCCESS,
  UNBAN,
  UNBLOCK,
  USER_CHANNELS,
} from "./subscriptions-events-constants";

@UsePipes(new ValidationPipe({ whitelist: true }))
@WebSocketGateway({
  namespace: "/api/chat",
  cors: "*",
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly channelService: ChannelService,
    private readonly userService: UserService,
    private readonly chatUserService: ChatUserService,
    private readonly joinedChannelService: JoinedChannelService,
    private readonly messageService: MessageService,
    private readonly muteService: MuteService,
  ) {}

  async onModuleInit() {
    await this.chatUserService.deleteAll();
    await this.muteService.purge();
    await this.joinedChannelService.purge();
    // await this.messageService.purge();
    // await this.channelService.purge();
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    Logger.log(`New CHAT connection: ${socket.id}`);
    // console.log(socket.handshake.headers)

    let user = socket.request["user"];
    if (!user) {
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
            if (!jC)  {
              await this.joinedChannelService.create(user, socket.id, channel);
            } else  {
              if (jC.socketId !== socket.id)  {
                jC.socketId = socket.id;
                await this.joinedChannelService.updateSocket(jC);
              }
            }
          }
        }
        /**to announce readynessness */
        this.success(socket, HttpStatus.OK);
      } catch (error) {
        this.emitError(socket, error);
        return this.noAccess(socket)
      }
    }
  }

  async handleDisconnect(socket: Socket) {
    Logger.log(`Client disconnected ${socket.id}`);
    await this.chatUserService.deleteBySocketId(socket.id);
    socket.disconnect();
  }

  /**bye bye */
  private noAccess(socket: Socket) {
    socket.emit("error", new UnauthorizedException());
    socket.disconnect();
  }

  /** Create a new channel */
  @SubscribeMessage(CREATE)
  async onCreateChannel(@ConnectedSocket() socket: Socket, @MessageBody() channelInfo: CreateChannelDto) {
    const user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    Logger.debug(`at CREATE  ${channelInfo.name}`);
    try {
      if (!CHANNEL_NAME_REGEX.test(channelInfo.name)) {
        throw new BadRequestException("Bad channel name format");
      }
      if (channelInfo.type === "protected") {
        if (!channelInfo.password || channelInfo.password.length < 1) {
          throw new BadRequestException("No password provided");
        }
        if (!SAFE_PASSWORD_REGEX.test(channelInfo.password)) {
          throw new BadRequestException("Password not safe!");
        }
      }
      const channel = await this.channelService.createChannel(channelInfo, user);
      await this.joinedChannelService.create(user, socket.id, channel);
      this.onGetUsersChannels(socket);
      if (channel.type !== "private") {
        this.newPublic();
      }
    } catch  (error)  {
        this.emitError(socket, error);
    }
  }

  /** update public channel list for all online users */
  private async newPublic() {
    const publicChannels: Channel[] = (await this.channelService.getAllChannels()).filter(c => !c.private);
    const onlineUsers = await this.chatUserService.getAll();
    for (const onlineUser of onlineUsers) {
      this.server.to(onlineUser.socketId).emit(
        CHANNELS,
        publicChannels
          .filter(c => {
            if (!c.users.some(u => u.id === onlineUser.user.id)) {
              return c;
            }
          })
          .filter(c => {
            if (!c.banned.some(banned => banned.id === onlineUser.user.id)) {
              return c;
            }
          })
          .map(c => this.channelToFe(c)),
      );
    }
  }

  /** event emiter for User[] group */
  private async emitToChatUsers(event: string, criteria: User[] | null, info: any /*User[] | Channel[]*/) {
    const chatUsers = await this.chatUserService.getAll();
    if (event === USER_CHANNELS)  {
      for (const chatUser of chatUsers) {
        if (criteria.some((u) => chatUser.user.id === u.id)) {
          const channels = await this.channelService.getUsersChannels(chatUser.user.id);
          const user = await this.userService.getUserWith(chatUser.user.id, [
            'blockedUsers', 'bannedAt'
          ]);
          const cToFe = this.userChannelsToFe(user, channels);
          this.server.to(chatUser.socketId).emit(event, cToFe)
        }
      }
    } else if (!criteria)  {
      for (const chatUser of chatUsers) {
        this.server.to(chatUser.socketId).emit(event, info);
      }
    } else {
      for (const chatUser of chatUsers) {
        if (criteria.some(u => u.id === chatUser.user.id)) {
          this.server.to(chatUser.socketId).emit(event, info);
        }
      }
    }
  }

  /** join a channel  */
  @SubscribeMessage(JOIN)
  async onJoin(@ConnectedSocket() socket: Socket, @MessageBody() joinInfo: JoinChannelDto) {
    let user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    Logger.debug("at JOIN");
    try {
      const channel: Channel = await this.channelService.join(user, joinInfo);
      if (channel.private) {
        user = await this.userService.getUserWith(user.id, ["invitedTo"]);
        user.invitedTo = user.invitedTo.filter((c: Channel) => c.id !== channel.id);
        await this.userService.saveUser(user);
      }
      await this.joinedChannelService.create(user, socket.id, channel);
      this.onGetUsersChannels(socket);
      this.onGetAllChannels(socket);
      const usersWithChatRelations = await this.usersWithChatRelations(channel.users);
      this.emitToChatUsers(CHANNEL_USERS, channel.users, {
        cId: channel.id,
        users: usersWithChatRelations,
      });
      return;
    } catch (error) {
      this.emitError(socket, error);
    }
  }

  /** leave a channel */
  @SubscribeMessage(LEAVE)
  async onLeave(@ConnectedSocket() socket: Socket, @MessageBody() channelInfo: cIdDto) {
    const user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    Logger.debug("at LEAVE");
    try {
      const channel = await this.channelService.getChannel(channelInfo.cId, ["owner", "users", "admins"]);
      if (!channel) {
        return this.emitError(socket, new BadRequestException("No such channel"));
      }
      //delete channel if owner leaves
      if (channel.type === "direct") {
        throw new BadRequestException("NO LEAVING FOR DIRECT MESSAGING!");
      }
      if (user.id === channel.owner?.id) {
        return this.onDelete(socket, channelInfo);
      }
      channel.admins = channel.admins.filter(u => u.id !== user.id);
      channel.users = channel.users.filter(u => u.id !== user.id);
      const u = await this.userService.getUserWith(user.id, ["channels", "adminAt"]);
      u.channels = u.channels.filter(c => c.id !== channel.id);
      u.adminAt = u.adminAt.filter(c => c.id !== channel.id);
      await this.channelService.saveChannel(channel);
      await this.userService.saveUser(u);
      await this.joinedChannelService.deleteBySocketId(socket.id, channel);
      //not possile but still
      if (channel.users.length === 0) {
        this.onDelete(socket, channelInfo);
      }
      //emit user's channels
      this.onGetUsersChannels(socket);
      const usersWithChatRelations = await this.usersWithChatRelations(channel.users);
      this.emitToChatUsers(CHANNEL_USERS, channel.users, {
        cId: channel.id,
        users: usersWithChatRelations
      });
    } catch (error) {
      this.emitError(socket, error);
    }
  }

  /** emits channel messages */
  @SubscribeMessage(CHANNEL_MESSAGES)
  async onGetChannelMessages(@ConnectedSocket() socket: Socket, @MessageBody() channelInfo: cIdDto) {
    let user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    Logger.debug("at CHANNEL_MESSAGES");
    try {
      const channel = await this.channelService.getChannel(channelInfo.cId, ["users"]);
      if (!channel) {
        throw new BadRequestException("No such channel");
      }
      if (!channel.users.some(u => u.id === user.id)) {
        throw new BadRequestException("User not on the channel");
      }
      user = await this.userService.getUserWith(user.id, ["blockedUsers"]);
      let messages = await this.messageService.findMessagesForChannel(channel);
      for (const blockedUser of user.blockedUsers) {
        messages = messages.filter((msg: Message) => msg.user.id !== blockedUser.id);
      }
      messages = messages.sort((m1, m2) => m1.createdAt.getTime() - m2.createdAt.getTime());
      // .filter((msg) => msg.user !== null);
      const msgsToFe = messages.map(m => {
        if (user.id === m.user.id) {
          m["sessionUser"] = true;
        } else {
          m["sessionUser"] = false;
        }
        return m;
      });
      this.server.to(socket.id).emit(CHANNEL_MESSAGES, msgsToFe);
    } catch (error) {
      this.emitError(socket, error);
    }
  }

  /** message broadcast */
  @SubscribeMessage(MESSAGE)
  async onMessage(socket: Socket, message: CreateMessageDto) {
    let user: User = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    Logger.debug("at MESSAGE");
    try {
      const channel = await this.channelService.getChannel(message.cId, ["users"]);
      if (!channel) {
        throw new BadRequestException("No such channel");
      }
      if (!channel.users.some(u => u.id === user.id)) {
        throw new BadRequestException("User not on the channel");
      }
      if (channel.type === "direct") {
        user = await this.userService.getUserWith(user.id, ["blockedUsers"]);
        for (const interlocutor of channel.users) {
          if (interlocutor.id !== user.id) {
            const u = await this.userService.getUserWith(interlocutor.id, ["blockedUsers"]);
            if (u.blockedUsers.some(blocked => blocked.id === user.id)) {
              throw new BadRequestException("User blocked you");
            }
            if (user.blockedUsers.some(blocked => blocked.id === interlocutor.id)) {
              throw new BadRequestException("You're blocking the user");
            }
          }
        }
      }
      if (channel.type !== "direct") {
        const isMuted = await this.muteService.getMute(user.id, channel.id);
        if (isMuted) {
          if (isMuted.mutedUntil.getTime() > new Date().getTime()) {
            throw new BadRequestException("You're muted");
          } else {
            await this.muteService.deleteMute(isMuted.id);
          }
        }
      }
      const newMsg = await this.messageService.newMessage(channel, user, message);
      const joinedUsers: JoinedChannel[] = await this.joinedChannelService.findByChannel(channel);
      for (const user of joinedUsers) {
        const u = await this.userService.getUserWith(user.user.id, ["blockedUsers"]);
        if (u.blockedUsers.some(blockedUser => blockedUser.id === newMsg.user.id)) {
          continue;
        }
        if (u.id === newMsg.user.id) {
          newMsg["sessionUser"] = true;
        } else {
          newMsg["sessionUser"] = false;
        }
        this.server.to(user.socketId).emit(MESSAGE, newMsg);
      }
    } catch (error) {
      this.emitError(socket, error);
    }
  }

  /** emit channels, available for the user */
  @SubscribeMessage(CHANNELS)
  async onGetAllChannels(@ConnectedSocket() socket: Socket) {
    let user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    Logger.debug("at CHANNELS");
    try {
      const channels = await this.channelService.getAllChannels();
      user = await this.userService.getUserWith(user.id, ["bannedAt"]);
      const cToFe = channels
        .filter(c => !c.private)
        .map(c => this.channelToFe(c))
        .filter(c => !user.bannedAt.some((bannedAt: Channel) => bannedAt.id === c.id))
        .sort((c1, c2) => c1.updatedAt.getDate() - c2.updatedAt.getDate())
        .filter(c => {
          if (!c.users.some(u => u.id === user.id)) {
            return c;
          }
        });
      this.server.to(socket.id).emit(CHANNELS, cToFe);
    } catch (error) {
      return this.emitError(socket, error);
    }
  }

  /** emit channels, that the user is in */
  @SubscribeMessage(USER_CHANNELS)
  async onGetUsersChannels(@ConnectedSocket() socket: Socket) {
    let user: User = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    Logger.debug("at USER_CHANNELS");
    try {
      const channels = await this.channelService.getUsersChannels(user.id)
      user = await this.userService.getUserWith(user.id, [
        'blockedUsers', 'bannedAt'
      ]);
      const cToFe = this.userChannelsToFe(user, channels);
      this.server.to(socket.id).emit(USER_CHANNELS, cToFe);
      return;
    } catch (error) {
      this.emitError(socket, error);
    }
  }

  /** prepare user's channel list for the FE */
  private userChannelsToFe(user: User, channels: Channel[]): ChannelToFeDto[] {
    const cToFe: ChannelToFeDto[] = channels
          .filter((c) => {
            if (c.type === 'direct')  {
              for (let u of c.users)  {
                if (u.id !== user.id) {
                  if (!(user.blockedUsers.some((blocked) => blocked.id === u.id))){
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

  /** delete a channel */
  @SubscribeMessage(DELETE)
  async onDelete(@ConnectedSocket() socket: Socket, @MessageBody() cId: cIdDto) {
    const user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    Logger.debug(`at DELETE ${cId.cId}`);
    try {
      const channel = await this.channelService.getChannel(cId.cId, [
        "owner",
        "users",
        // "messages.user",
        "admins",
        "joinedUsers",
        "messages",
        // "messages.user.messages",
        "banned",
        "invitedUsers",
      ]);
      if (!channel) {
        return this.emitError(socket, "No such channel");
      }
      if (channel.owner) {
        if (channel.owner?.id !== user.id) {
          return this.emitError(socket, new BadRequestException("No rights"));
        }
      }
      for (const user of channel.users) {
        const u = await this.userService.getUserWith(user.id, [
          'channels', 'adminAt', 'joinedChannels', 'joinedChannels.channel', 'ownedChannels', 'messages', "messages.channel"
        ]);
        if (u.channels) {
          u.channels = u.channels.filter(c => c.id !== channel.id);
        }
        if (u.adminAt) {
          u.adminAt = u.adminAt.filter(c => c.id !== channel.id);
        }
        if (u.joinedChannels) {
          u.joinedChannels = u.joinedChannels.filter((jC) => jC.channel.id !== channel.id);
        }
        if (u.ownedChannels) {
          u.ownedChannels = u.ownedChannels.filter(ownedC => ownedC.id !== channel.id);
        }
        if (u.messages) {
          u.messages = u.messages.filter((msg) => msg.channel.id !== channel.id)
        }
        await this.userService.saveUser(u);
      }
      for (const banned of channel.banned) {
        const user = await this.userService.getUserWith(banned.id, ["bannedAt"]);
        user.bannedAt = user.bannedAt.filter(c => c.id !== channel.id);
        await this.userService.saveUser(user);
      }
      if (channel.private) {
        for (const invited of channel.invitedUsers) {
          const user = await this.userService.getUserWith(invited.id, ["invitedTo"]);
          user.invitedTo = user.invitedTo.filter(c => c.id !== channel.id);
          await this.userService.saveUser(user);
        }
      }
      //Updating channel lists for FE
      /*const chatUsers = await this.chatUserService.getAll();
      for (const chatUser of chatUsers) {
        if (channel.users.some(u => chatUser.user.id === u.id)) {
          const userWithBlocked = await this.userService.getUserWith(chatUser.user.id, ["blockedUsers", "bannedAt"]);
          const cToFe = this.userChannelsToFe(userWithBlocked, await this.channelService.getUsersChannels(chatUser.user.id));
          this.server.to(chatUser.socketId).emit(USER_CHANNELS, cToFe);
        }
      }
      */
      this.emitToChatUsers(USER_CHANNELS, channel.users, 'foo')
      await this.muteService.deleteMutesByChannel(channel.id);
      await this.joinedChannelService.deleteByChannel(channel);
      await this.messageService.deleteByChannel(channel);
      await this.channelService.delete(channel.id);
      this.newPublic();
    } catch (error) {
      this.emitError(socket, error);
    }
  }

  private emitError(socket: Socket, error: any) {
    this.server.to(socket.id).emit(ERROR, error);
  }

  private success(socket: Socket, info: any) {
    this.server.to(socket.id).emit(SUCCESS, info)
  }

  /** kick a user from the channel */
  @SubscribeMessage(KICK)
  async onKick(@ConnectedSocket() socket: Socket, @MessageBody() info: UpdateChannelDto) {
    const user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    Logger.debug(`on KICK  ${info.uId} from ${info.cId}`);
    try {
      const channel = await this.channelService.getChannel(info.cId, ["owner", "admins", "users", "joinedUsers"]);
      let u = await this.userService.getUserWith(info.uId, ["channels", "joinedChannels"]);
      if (!channel || !u) {
        throw new BadRequestException("No such channel or user");
      }
      if (channel.owner?.id === info.uId) {
        throw new BadRequestException("Can't kick the owner");
      }
      if (!channel.admins.some(admin => admin.id === user.id)) {
        throw new BadRequestException("No rights");
      }
      channel.users = channel.users.filter(u => u.id !== info.uId);
      u.channels = u.channels.filter(c => c.id !== channel.id);
      const jCs = u.joinedChannels;
      const jUs = channel.joinedUsers;
      channel.joinedUsers = channel.joinedUsers.filter((jU) => !(jCs.some((jC) => jC.id === jU.id)))
      u.joinedChannels = u.joinedChannels.filter((jC) => !(jUs.some((jU) => jU.id === jC.id)))
      await this.joinedChannelService.deleteByUserChannel(u, channel);
      await this.userService.saveUser(u);
      await this.channelService.saveChannel(channel);
      this.onGetChannelUsers(socket, { cId: info.cId });
      this.success(socket, `${u.username} kicked out`);
      const kicked = await this.chatUserService.findByUser(u);
      if (kicked) {
        u = await this.userService.getUserWith(u.id, ["blockedUsers", "bannedAt"]);
        const channels = await this.channelService.getUsersChannels(u.id);
        const cToFe = this.userChannelsToFe(u, channels);
        this.server.to(kicked.socketId).emit(USER_CHANNELS, cToFe);
      }
    } catch (error) {
      this.emitError(socket, error);
    }
  }

  /** ban a user from accessing a channel */
  @SubscribeMessage(BAN)
  async onBan(@ConnectedSocket() socket: Socket, @MessageBody() info: UpdateChannelDto) {
    const user = socket.data.user;
    Logger.debug("at BAN");
    if (!user) {
      return this.noAccess(socket);
    }
    try {
      const channel = await this.channelService.getChannel(info.cId, ["owner", "users", "admins", "banned", "joinedUsers"]);
      let u = await this.userService.getUserWith(info.uId, ["channels", "adminAt", "bannedAt", "joinedChannels"]);
      if (!channel || !u) {
        throw new BadRequestException("No such channel or user");
      }
      if (channel.owner?.id === info.uId) {
        throw new BadRequestException("Can't ban the owner");
      }
      if (!channel.admins.some(admin => admin.id === user.id)) {
        throw new BadRequestException("No rights");
      }
      if (channel.banned.some(banned => banned.id === u.id)) {
        throw new BadRequestException("Already banned");
      }
      channel.users = channel.users.filter(u => u.id !== info.uId);
      channel.admins = channel.admins.filter(admin => admin.id !== info.uId);
      channel.banned.push(u);
      u.channels = u.channels.filter(c => c.id !== channel.id);
      u.adminAt = u.adminAt.filter(adminAt => adminAt.id !== channel.id);
      await this.userService.saveUser(u);
      u = await this.userService.getUserWith(u.id, ["blockedUsers", "bannedAt"]);
      await this.channelService.saveChannel(channel);
      await this.joinedChannelService.deleteByUserChannel(u, channel);
      this.server.to(socket.id).emit(CHANNEL, this.channelToFe(channel));
      this.onGetChannelUsers(socket, { cId: channel.id });
      const banned = await this.chatUserService.findByUser(u);
      if (banned) {
        const channels = (await this.channelService.getUsersChannels(u.id))
        this.server.to(banned.socketId).emit(USER_CHANNELS, this.userChannelsToFe(u, channels));
      }
    } catch (error) {
      this.emitError(socket, error);
    }
  }

  /** unban user from channel */
  @SubscribeMessage(UNBAN)
  async onUnban(@ConnectedSocket() socket: Socket, @MessageBody() info: UpdateChannelDto) {
    const user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    Logger.debug("at UNBAN");
    try {
      const channel = await this.channelService.getChannel(info.cId, ["owner", "admins", "banned"]);
      const u = await this.userService.getUserWith(info.uId, ["bannedAt"]);
      if (!channel || !u) {
        throw new BadRequestException("No such channel or user");
      }
      if (!channel.admins.some(admin => admin.id === user.id)) {
        throw new BadRequestException("No rights");
      }
      if (!channel.banned.some(banned => banned.id === info.uId)) {
        throw new BadRequestException("Not banned");
      }
      channel.banned = channel.banned.filter(u => u.id !== info.uId);
      u.bannedAt = u.bannedAt.filter(c => c.id !== info.cId);
      await this.userService.saveUser(u);
      await this.channelService.saveChannel(channel);
      this.server.to(socket.id).emit(CHANNEL, this.channelToFe(channel));
    } catch (error) {
      this.emitError(socket, error);
    }
  }

  /** mute a user in channel */
  @SubscribeMessage(MUTE)
  async onMute(@ConnectedSocket() socket: Socket, @MessageBody() info: UpdateChannelDto) {
    const user = socket.data.user;
    Logger.debug("at MUTE");
    if (!user) {
      return this.noAccess(socket);
    }
    try {
      const channel = await this.channelService.getChannel(info.cId, ["owner", "admins"]);
      const u = await this.userService.getUserWith(info.uId, ["channels"]);
      if (!channel || !u) {
        throw new BadRequestException("No such channel or user");
      }
      if (!channel.admins.some(admin => admin.id === user.id)) {
        throw new BadRequestException("No rights");
      }
      if (!u.channels.some(c => c.id === channel.id)) {
        throw new BadRequestException("User not on channel");
      }
      if (channel.owner?.id === info.uId) {
        return this.emitError(socket, new BadRequestException("Can't mute the owner"));
      }
      await this.muteService.mute(u.id, channel.id);
    } catch (error) {
      this.emitError(socket, error);
    }
  }

  /** promote a user to admin */
  @SubscribeMessage(ADD_ADMIN)
  async onAddAdmin(@ConnectedSocket() socket: Socket, @MessageBody() info: UpdateChannelDto) {
    const user = socket.data.user;
    Logger.debug("at ADD_ADMIN");
    if (!user) {
      return this.noAccess(socket);
    }
    try {
      const channel = await this.channelService.getChannel(info.cId, ["owner", "admins", "users"]);
      const u = await this.userService.findUserById(info.uId);
      if (!u || !channel) {
        return this.emitError(socket, new BadRequestException("No such channel or user"));
      }
      if (channel?.owner?.id !== user.id) {
        throw new BadRequestException("No rights");
      }
      if (!channel.users.some(someone => someone.id === u.id)) {
        throw new BadRequestException("User not on the channel");
      }
      if (channel.admins.some(admin => admin.id === info.uId)) {
        throw new BadRequestException("Already an admin");
      }
      channel.admins.push(u);
      await this.channelService.saveChannel(channel);
      const usersWithChatRelations = await this.usersWithChatRelations(channel.users);
      this.emitToChatUsers(CHANNEL_USERS, channel.users, {
        cId: channel.id,
        users: usersWithChatRelations,
      });
    } catch (error) {
      return this.emitError(socket, error);
    }
  }

  /** demote user from admin */
  @SubscribeMessage(REM_ADMIN)
  async onDelAdmin(@ConnectedSocket() socket: Socket, @MessageBody() info: UpdateChannelDto) {
    const user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    Logger.debug("at REM_ADMIN");
    try {
      const channel = await this.channelService.getChannel(info.cId, ["owner", "admins", "users"]);
      const u = await this.userService.getUserWith(info.uId, ["adminAt"]);
      if (!channel || !u) {
        throw new BadRequestException("No such channel or user");
      }
      if (channel.owner?.id !== user.id) {
        throw new BadRequestException("No rights");
      }
      if (channel.owner?.id === u.id) {
        throw new BadRequestException("Can't remove self");
      }
      if (channel.admins.some(admin => admin.id === u.id)) {
        channel.admins = channel.admins.filter(admin => admin.id !== u.id);
        u.adminAt = u.adminAt.filter(c => c.id !== channel.id);
        await this.userService.saveUser(u);
        await this.channelService.saveChannel(channel);
        const usersWithChatRelations = await this.usersWithChatRelations(channel.users);
        this.emitToChatUsers(CHANNEL_USERS, channel.users, {
          cId: channel.id,
          users: usersWithChatRelations,
        });
      } else  {
        throw new BadRequestException('User is not an admin')
      }
    } catch (error) {
      this.emitError(socket, error);
    }
  }

  @SubscribeMessage(INVITE_TO_PRIVATE)
  async onInviteToPriv(@ConnectedSocket() socket: Socket, @MessageBody() info: UpdateChannelDto) {
    const user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    Logger.debug("at INVITE_TO_PRIVATE");
    try {
      const u = await this.userService.getUserWith(info.uId, []);
      const channel = await this.channelService.getChannel(info.cId, ["users", "invitedUsers"]);
      if (!u || !channel) {
        throw new BadRequestException("No such channel or user");
      }
      if (!channel.private) {
        throw new BadRequestException("Channel is not private");
      }
      if (channel.users.some(user => user.id === u.id)) {
        throw new BadRequestException("User is already in the channel");
      }
      if (channel.invitedUsers.some(user => user.id === u.id)) {
        throw new BadRequestException("User is already invited");
      }
      channel.invitedUsers.push(u);
      await this.channelService.saveChannel(channel);
    } catch (error) {
      this.emitError(socket, error);
    }
  }

  /** accept an invite to private channel */
  @SubscribeMessage(ACCEPT_PRIVATE_INVITE)
  async onAcceptPriv(@ConnectedSocket() socket: Socket, @MessageBody() info: PrivateInviteDto) {
    const user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    Logger.debug("at ACCEPT_PRIVATE_INVITE");
    try {
      await this.onJoin(socket, { id: info.cId });
      const msg = await this.invalidateMsgContent(info.msgId);
      if (msg) {
        this.onGetChannelMessages(socket, { cId: msg.channel.id });
      }
    } catch (error) {
      this.emitError(socket, error);
    }
  }

  /** 'Content no longer available' */
  private async invalidateMsgContent(msgId: number): Promise<Message> {
    const msg = await this.messageService.findById(msgId);
    if (msg) {
      msg.content = "*Content no longer available*";
      msg.inviteId = null;
      msg.inviteType = null;
      return await this.messageService.save(msg);
    }
    return;
  }

  /** reject invitation to private channel */
  @SubscribeMessage(DECLINE_PRIVATE_INVITE)
  async onDeclinePriv(@ConnectedSocket() socket: Socket, @MessageBody() info: PrivateInviteDto) {
    const user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    Logger.debug("DECLINE_PRIVATE_INVITE");
    try {
      const u = await this.userService.getUserWith(user.id, ["invitedTo"]);
      const channel = await this.channelService.getChannel(info.cId, ["invitedUsers"]);
      if (!u || !channel) {
        throw new BadRequestException("No such channel or user");
      }
      if (!u.invitedTo.some((channel: Channel) => channel.id == info.cId)) {
        throw new BadRequestException("Not invited");
      }
      channel.invitedUsers = channel.invitedUsers.filter(user => user.id !== u.id);
      u.invitedTo = u.invitedTo.filter(c => c.id !== channel.id);
      await this.userService.saveUser(u);
      await this.channelService.saveChannel(channel);
      const msg = await this.invalidateMsgContent(info.msgId);
      if (msg)  {
        this.onGetChannelMessages(socket, {cId: msg.channel.id})
      }
    } catch (error) {
      this.emitError(socket, error);
    }
  }

  /** channel password updates */
  @SubscribeMessage(PASSWORD)
  async onPassword(@ConnectedSocket() socket: Socket, @MessageBody() passInfo: ChannelPasswordDto) {
    const user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    Logger.debug("at PASSWORD");
    try {
      const channel = await this.channelService.getChannel(passInfo.cId, [
        'owner', 'users'
      ]) 
      if (!channel) {
        throw new BadRequestException("No such channel");
      }
      if (user.id !== channel.owner?.id) {
        throw new BadRequestException("No rights");
      }
      await this.channelService.passwordService(passInfo);
      this.newPublic();
      this.emitToChatUsers(USER_CHANNELS, channel.users, 'foo');
    } catch (error) {
      this.emitError(socket, error);
    }
  }

  /** new direct message to a user, also invite to private channel/game */
  @SubscribeMessage(DIRECT)
  async onPriv(@ConnectedSocket() socket: Socket, @MessageBody() info: PrivMsgDto) {
    let user = socket.data.user;
    Logger.debug("at DIRECT");
    if (!user) {
      return this.noAccess(socket);
    }
    try {
      const u = await this.userService.getUserWith(info.uId, ["blockedUsers"]);
      if (!u) {
        throw new BadRequestException("No such user");
      }
      if (user.id === u.id) {
        throw new BadRequestException("No talking to yourself");
      }
      if (u.blockedUsers.some(blocked => blocked.id === user.id)) {
        throw new BadRequestException("User has blocked you");
      }
      user = await this.userService.getUserWith(user.id, ["blockedUsers"]);
      if (user.blockedUsers.some((blocked: User) => blocked.id === u.id)) {
        throw new BadRequestException("You're blocking the user");
      }
      if (info.inviteType) {
        if (!info.hasOwnProperty("inviteId")) {
          throw new BadRequestException("Missing invite info");
        }
        if (info.inviteType  === 'channel')  {
          const channel = await this.channelService.getChannel(info.inviteId, [
          'users', 'invitedUsers'
        ]);
        if (!channel) {
          throw new BadRequestException('No such channel')
        }
        if (!channel.private) {
          throw new BadRequestException('Channel is not private')
        }
        if (channel.users.some((user) => user.id === u.id)) {
          throw new BadRequestException('User is already in the channel')
        }
        if (channel.invitedUsers.some((user) => user.id === u.id))  {
          throw new BadRequestException('User is already invited')
        }
        channel.invitedUsers.push(u);
        await this.channelService.saveChannel(channel);
      } else if (info.inviteType === 'game') {
          Logger.debug(`Received game invite type message`)
      } else  {
          throw new BadRequestException('Wtf, go away')
      }
    }
    let room = await this.channelService.getDirectChannel(user, u);
    if (!room) {
      room =  await this.channelService.createPrivate(user, u);
      await this.joinedChannelService.create(user, socket.id, room);
      //update channel list for current user
      this.onGetUsersChannels(socket);
      const adresant = await this.chatUserService.findByUser(u);
      if (adresant) {
        await this.joinedChannelService.create(u, adresant.socketId, room);
        const hisChannels = (await this.channelService.getUsersChannels(u.id))
          .map((c) => this.channelToFe(c))
          .map((c) => {
            if (c.name) {
              return c;
            }
            for (const u of c.users) {
              if (u.id === user.id) {
                c.name = u.username;
                c.avatar = u.avatar;
              }
              return c
            }
          }
        );
        this.server.to(adresant.socketId).emit(USER_CHANNELS, hisChannels)
      }
    }
    const msg: CreateMessageDto = {
      cId: room.id,
      content: info.text
    }
    if (info.inviteType)  {
      msg.inviteType = info.inviteType;
      msg.inviteId = info.inviteId;
    }
      this.onMessage(socket, msg);
    } catch (error) {
      this.emitError(socket, error);
    }
  }

  /** block all communication with a user */
  @SubscribeMessage(BLOCK)
  async onBlock(@ConnectedSocket() socket: Socket, @MessageBody() userInfo: uIdDto) {
    const user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    Logger.debug("at BLOCK");
    try {
      if (user.id === userInfo.uId) {
        throw new BadRequestException("Can't block self");
      }
      await this.userService.blockUser(user.id, userInfo.uId);
      this.onGetUsersChannels(socket);
      this.onBlockedUsers(socket);
    } catch (error) {
      this.emitError(socket, error)
    }
  }

  /** unblock a user */
  @SubscribeMessage(UNBLOCK)
  async onUnBlock(@ConnectedSocket() socket: Socket, @MessageBody() userInfo: uIdDto) {
    const user = socket.data.user;
    Logger.debug("at UNBLOCK");
    if (!user) {
      return this.noAccess(socket);
    }
    try {
      await this.userService.unBlockUser(user.id, userInfo.uId);
      this.onGetUsersChannels(socket);
      this.onBlockedUsers(socket);
    } catch (error) {
      this.emitError(socket, error);
    }
  }

  /** emit channel's User[] */
  @SubscribeMessage(CHANNEL_USERS)
  async onGetChannelUsers(@ConnectedSocket() socket: Socket, @MessageBody() channelInfo: cIdDto) {
    const user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    Logger.debug("at CHANNEL_USERS");
    try {
      const channel = await this.channelService.getChannel(channelInfo.cId, ["users"]);
      if (!channel) {
        throw new BadRequestException("No such channel");
      }
      const usersWithChatRelations = await this.usersWithChatRelations(channel.users);
      this.server.to(socket.id).emit(CHANNEL_USERS, {
        cId: channel.id,
        users: usersWithChatRelations,
      });
      return;
    } catch (error) {
      this.emitError(socket, error);
    }
  }

  private async usersWithChatRelations(users: User[]): Promise<User[]> {
    return Promise.all(
      users.map(async (user: User) => {
        return await this.userService.getUserWith(user.id, ["adminAt", "bannedAt", "blockedUsers"]);
      }),
    );
  }

  private channelToFe(channel: Channel): ChannelToFeDto {
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

  /** emit channel obj */
  @SubscribeMessage(CHANNEL)
  async onGetChannel(@ConnectedSocket() socket: Socket, @MessageBody() channelInfo: cIdDto) {
    const user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    Logger.debug("at CHANNEL");
    try {
      const channel = await this.channelService.getChannel(channelInfo.cId, ["users", "admins", "banned"]);
      this.server.to(socket.id).emit(CHANNEL, this.channelToFe(channel));
    } catch (error) {
      this.emitError(socket, error);
    }
  }

  /** Content no longer available */
  @SubscribeMessage(INVALIDATE_MESSAGE_CONTENT)
  async onInvalidateMessageContent(@ConnectedSocket() socket: Socket, @MessageBody() msgInfo: cIdDto) {
    const user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    try {
      Logger.debug("INVALIDATE_MESSAGE_CONTENT");
      const msg = await this.invalidateMsgContent(msgInfo.cId);
      if (msg) {
        this.onGetChannelMessages(socket, { cId: msg.channel.id });
      }
    } catch (error) {
      this.emitError(socket, error);
    }
  }

  /** emits session user's blockedUsers User[] */
  @SubscribeMessage(BLOCKED_USERS)
  async onBlockedUsers(@ConnectedSocket() socket: Socket) {
    let user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    try {
      user = await this.userService.getUserWith(user.id, ["blockedUsers"]);
      if (user) {
        this.server.to(socket.id).emit(BLOCKED_USERS, user.blockedUsers);
      } else {
        throw new Error("Couldn't get user data");
      }
    } catch (error) {
      this.emitError(socket, error);
    }
  }

  @SubscribeMessage(ACHTUNG)
  onAchtung(@ConnectedSocket() socket: Socket, @MessageBody() msg: uIdDto)  {
    let user = socket.data.user;
    if (!user) {
      return this.noAccess(socket);
    }
    this.emitError(socket, new BadRequestException(msg.uId));
  }
} 