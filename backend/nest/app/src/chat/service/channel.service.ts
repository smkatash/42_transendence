import { BadRequestException, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from '../entities/channel.entity';
import { JoinChannelDto, CreateChannelDto } from '../dto/channel.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ChannelService {
    constructor(
        @InjectRepository(Channel)
        private readonly channelRepository: Repository<Channel>
        ){
    }

    async createChannel(channel: CreateChannelDto, owner: User): Promise<Channel>{
        // const exists = await this.channelRepository.findOneBy({name: CreateChannelDto.name})
        try {
            console.log('HERERERERER')
            console.log(channel)
            const newChannel = this.channelRepository.create(channel);
            newChannel.owner = owner;
            console.log('createchannel', newChannel)
            newChannel.messages = [];
            newChannel.users = [];
            newChannel.admins = [];
            newChannel.users.push(owner);
            return await this.channelRepository.save(newChannel);
        } catch (error) {
            Logger.error(error);
            if (error.code === 23505)   {
                throw new HttpException('Channel already exists', HttpStatus.BAD_REQUEST)
            }   else    {
                throw error;
            }
        }
    }

    async deleteChannel(user: User, id: number) {
        const channel = await this.channelRepository.findOne({
            where:  {
                id: id
            },
            // continue here
            relations:['users',] })
        if (!channel)   {
            throw new BadRequestException('No such channel') 
        }

    }
    async getUsersChannels(userId: number): Promise<Channel[]>  {
        const channels = await this.channelRepository
        .createQueryBuilder('channel')
        .leftJoin('channel.users', 'user')
        .where('user.id = :userId', {userId})
        .getMany();
        return channels;
    }

    async getAllChannels(): Promise<Channel[]>  {
        return await this.channelRepository.find();
    }

    async getChannel(channelId: number): Promise<Channel> {
        return await this.channelRepository.findOne({
            where: {id: channelId},
            // relations: ['users']
        })
    }
    async join(user: User, joinDto: JoinChannelDto) {
        const   channel: Channel = await this.channelRepository.findOne({
            where:  {
                id: joinDto.id
            },
            relations: ['users', '']
        })
        if (!channel)   {
            throw new BadRequestException('No such channel');
        }
        if (channel.users.includes(user)){
            throw new BadRequestException('Already in channel')
        }
        if (channel.private)    {
            //check if invited
        }
        if (channel.protected)  {
            //check password
        }
        channel.users.push(user);
        //if user in invited, remove user
        return await this.channelRepository.save(channel);
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
