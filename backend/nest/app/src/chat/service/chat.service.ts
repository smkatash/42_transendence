import { Injectable, Logger } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { ChannelService } from './channel.service';
import { MessageService } from './message.service';
import { createChannelDto } from '../dto/createChannel.dto';
import { User } from 'src/user/entities/user.entity';
import { Channel } from '../entities/channel.entity';

@Injectable()
export class ChatService {
   constructor(
    private readonly channelService: ChannelService,
    private readonly userService: UserService,
    private readonly msgService: MessageService
   ){} 
   
   async getChats(): Promise<Channel[]> {
      return await this.channelService.getAllChannels();
   }

   async getUsersChats(userId: number): Promise<Channel[]>   {
      return await this.channelService.getUsersChannels(userId);
   }

   async newChannel(channelInfo: createChannelDto, user: User): Promise<Channel> {
      try   {
         const channel = await this.channelService.createChannel(channelInfo, user);
         try   {
            user.channels.push(channel);
            this.userService.saveUser(user);
            return channel;
         }  catch (error)  {
            Logger.error(error);           
            //TODO delete channel
            // await this.channelService.
            return ;
         }
      } catch  (error)  {
         Logger.error(error);
         return ;
      }
   }

   async deleteChat(user: User, channelId: number) {

   }

   async join(user: User, channelId: number) {

   }

   async leave(user: User, channelId)  {

   }
   
   async kick(user: User, userId: number, channelId: number)   {

   }

   async ban(user: User, userId: number, channelId: number)   {
      
   }
   async mute(user: User, userId: number, channelId: number)   {
      
   }
   async addAdmin(user: User, userId: number, channelId: number)   {
      
   }
   async removeAdmin(user: User, userId: number, channelId: number)   {
      
   }
   async inviteToGame(user: User, userId: number, channelId: number)   {
      
   }

   async inviteToPrivate(user: User, userId: number, channelId: number) {

   }

   async password(user: User, oldPass: string, newPass: string)   {

   }
}
