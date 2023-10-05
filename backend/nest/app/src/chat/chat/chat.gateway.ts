import { Logger } from '@nestjs/common';
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({namespace: 'chat'})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
  private readonly logger = new Logger(ChatGateway.name)
  
  private channels = new Map<string, Set<Socket>>();

  @WebSocketServer()
  server: Server
  
  afterInit(server: any) {
    this.logger.log("Initialized")
  }


  //check for bannded user
  //invite user to channel
  //check for channel existance
  //check for channel privacy
  //check for channel password
  async handleConnection(@ConnectedSocket() client: any, ...args: any[]) {
    this.logger.log(`Client id: ${client.id} connected`);
  }

  //check for channel existance
  handleDisconnect(@ConnectedSocket() client: any) {
    this.logger.log(`Cliend id:${client.id} disconnected`)
    this.removeClientFromChannels(client)
  }

  private removeClientFromChannels(client: Socket) {
    this.channels.forEach((sockets: Set<Socket>, channel: string) => {
      if (sockets.has(client)) {
        sockets.delete(client)
        this.logger.log(`Client id:${client.id} removed from channel ${channel}`)
      }
    })
  }
  joinChannel(client: Socket, channel: string) {
    // Create the channel if it doesn't exist
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    // Add the client to the channel
    this.channels.get(channel).add(client);
    // Notify the client that they joined the channel
    client.emit('joinedChannel', `You have joined the ${channel} channel.`);
  }

  leaveChannel(client: Socket, channel: string) {
    if (this.channels.has(channel)) {
      // Remove the client from the channel
      this.channels.get(channel).delete(client);

      // Notify the client that they left the channel
      client.emit('leftChannel', `You have left the ${channel} channel.`);
    }
  }
  
  @SubscribeMessage('joinChannel')
  handleJoinChannel(client: Socket, channel: string) {
    this.logger.log(`Cliend id:${client.id} joined channel ${channel}`)
    this.joinChannel(client, channel);
  }

  @SubscribeMessage('leaveChannel')
  handleLeaveChannel(client: Socket, channel: string) {
    this.logger.log(`Cliend id:${client.id} left channel ${channel}`)
    this.leaveChannel(client, channel);
  }

  @SubscribeMessage('chatMessage')
  handleChatMessage(client: Socket, payload: { channel: string, message: string }) {
    const { channel, message } = payload;
    this.logger.log(`Cliend id:${client.id} sent message to channel ${channel}`)
    if (this.channels.has(channel)) {
      // Broadcast the message to all clients in the channel
      this.channels.get(channel).forEach((socket) => {
        socket.emit('message', { sender: client.id, message });
      }
      );
    } 
    else
    { 
      client.emit('errorMessage', `You are not in the ${channel} channel.`);
    }    
  }
  @SubscribeMessage(`createChannel`)
  handleCreateChannel(client: Socket, channel: string) {
    this.logger.log(`Cliend id:${client.id} created channel ${channel}`)
    this.joinChannel(client, channel);
  }
  @SubscribeMessage(`deleteChannel`)
  handleDeleteChannel(client: Socket, channel: string) {
    this.logger.log(`Cliend id:${client.id} deleted channel ${channel}`)
    this.leaveChannel(client, channel);
  }

  @SubscribeMessage(`inviteUser`)
  handleInviteUser(client: Socket, channel: string, new_user: string) {
    this.logger.log(`Cliend id:${client.id} invited ${new_user} to channel ${channel}`)
    // this.joinChannel(new_user, channel);
  }

  @SubscribeMessage(`banUser`)
  handleBanUser(client: Socket, channel: string) {
    this.logger.log(`Cliend id:${client.id} banned user from channel ${channel}`)
    this.leaveChannel(client, channel);
  }

  //remove user from banned list
  @SubscribeMessage(`unbanUser`)
  handleUnbanUser(client: Socket, channel: string) {
    this.logger.log(`Cliend id:${client.id} unbanned user from channel ${channel}`)
    this.joinChannel(client, channel);
  }

  @SubscribeMessage(`setChannelPrivacy`)
  handleSetChannelPrivacy(client: Socket, channel: string) {
    this.logger.log(`Cliend id:${client.id} set channel privacy ${channel}`)
    this.leaveChannel(client, channel);
  }
  
  @SubscribeMessage(`setChannelPassword`)
  handleSetChannelPassword(client: Socket, channel: string) {
    this.logger.log(`Cliend id:${client.id} set channel password ${channel}`)
    this.joinChannel(client, channel);
  }

  @SubscribeMessage(`setChannelName`)
  handleSetChannelName(client: Socket, channel: string) {
    this.logger.log(`Cliend id:${client.id} set channel name ${channel}`)
    this.leaveChannel(client, channel);
  }

  @SubscribeMessage(`setChannelDescription`)
  handleSetChannelDescription(client: Socket, channel: string) {
    this.logger.log(`Cliend id:${client.id} set channel description ${channel}`)
    this.joinChannel(client, channel);
  }

  @SubscribeMessage(`setChannelTopic`)
  handleSetChannelTopic(client: Socket, channel: string) {
    this.logger.log(`Cliend id:${client.id} set channel topic ${channel}`)
    this.leaveChannel(client, channel);
  }

  @SubscribeMessage(`setChannelIcon`)
  handleSetChannelIcon(client: Socket, channel: string) {
    this.logger.log(`Cliend id:${client.id} set channel icon ${channel}`)
    this.joinChannel(client, channel);
  }

  @SubscribeMessage(`setChannelBanner`)
  handleSetChannelBanner(client: Socket, channel: string) {
    this.logger.log(`Cliend id:${client.id} set channel banner ${channel}`)
    this.leaveChannel(client, channel);
  }

  @SubscribeMessage(`setChannelOwner`)
  handleSetChannelOwner(client: Socket, channel: string) {
    this.logger.log(`Cliend id:${client.id} set channel owner ${channel}`)
    this.joinChannel(client, channel);
  }

  @SubscribeMessage(`setChannelModerator`)
  handleSetChannelModerator(client: Socket, channel: string) {
    this.logger.log(`Cliend id:${client.id} set channel moderator ${channel}`)
    this.leaveChannel(client, channel);
  }
}