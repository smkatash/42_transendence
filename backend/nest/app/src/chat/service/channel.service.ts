import { BadRequestException, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from '../entities/channel.entity';
import { JoinChannelDto, CreateChannelDto, ChannelPasswordDto } from '../dto/channel.dto';
import { User } from 'src/user/entities/user.entity';
import * as bcrypt from 'bcrypt'
import { POSTGRES_UNIQUE_VIOLATION, SALT_ROUNDS } from 'src/Constants';

@Injectable()
export class ChannelService {
    constructor(
        @InjectRepository(Channel)
        private readonly channelRepository: Repository<Channel>
        ){}

    async createChannel(channelInfo: CreateChannelDto, owner: User): Promise<Channel>{

        try {
            // console.log(channel)
            
            const channel = this.channelRepository.create(channelInfo);
            channel.owner = owner
            console.log('createchannel', channel)
            channel.messages = [];
            channel.users = [];
            channel.admins = [];
            channel.banned = [];
            channel.type = channelInfo.type;
            if (channel.private)    {
                channel.invitedUsers = [];
            }
            channel.users.push(owner);
            channel.admins.push(owner);
            if (channelInfo.password?.length)   {
                const hash = await bcrypt.hash(channelInfo.password, SALT_ROUNDS);
                channel.hash = hash;
                channel.protected = true;
            }
            console.log(channel)
            const c = await this.channelRepository.save(channel);
            console.log('----saved channel, at create chann---')
            console.log(c)
            return c
            
        } catch (error) {
            Logger.error(error);
            if (error.code === POSTGRES_UNIQUE_VIOLATION)   {
                throw new HttpException('Channel already exists', HttpStatus.BAD_REQUEST)
            }   else    {
                throw error;
            }
        }
    }

    async delete(id: number) {
        return await this.channelRepository.delete(id);
    }

    async getUsersChannels(userId: string): Promise<Channel[]>  {
        // const channels = await this.channelRepository
        // .createQueryBuilder('channel')
        // .leftJoin('channel.users', 'user')
//        // .leftJoinAndSelect('channel.users', 'user')
        // .where('user.id = :userId', {userId})
        // .getMany();
        // return channels;
        // return await this.channelRepository.find({
        //     where: {
        //         users: {
        //            id: userId 
        //         }
        //     },
        //     relations: [
        //         'users'
        //     ]
        // })
        const channels = (await this.channelRepository.find({
            relations: [
                'users'
            ]
        }))
        return channels.filter((c) => c.users.some((user) => user.id === userId));
         

    }

    async getAllChannels(): Promise<Channel[]>  {
        return await this.channelRepository.find({
            relations: ['users']
        });
    }

    async getChannel(channelId: number, relations: string[]): Promise<Channel> {
        return await this.channelRepository.findOne({
            where: {id: channelId},
            relations:  relations
        })
    }
    async join(user: User, joinDto: JoinChannelDto) {
        console.log(joinDto.id)
        const   channel: Channel = await this.channelRepository.findOne({
            where:  {
                id: joinDto.id
            },
            relations: ['users', 'banned', 'invitedUsers']
        })
        if (!channel)   {
            throw new BadRequestException('No such channel');
        }
        console.log(channel.id)
console.log('--------join channels users------')
        console.log(channel)
        if (channel.banned.some((banned) => banned.id === user.id)) {
            throw new BadRequestException('No access(banned)')
        }
        
        if (channel.users.some((u) => u.id === user.id)){
            throw new BadRequestException('Already in channel')
        }
        if (channel.private)    {
            //check if invited
            if (!(channel.invitedUsers.some((invited) => invited.id === user.id)))  {
                throw new BadRequestException('No access to private channel')
            }   else    {
                channel.invitedUsers = channel.invitedUsers.filter((iU) => iU.id !== user.id);
            }
        }
        //check password
        if (channel.hash)  {
            if (!(joinDto.password))    {
                throw new BadRequestException('No password provided')
            }
            const passMatch = await bcrypt.compare(joinDto.password, channel.hash);
            if (!passMatch) {
                throw new BadRequestException('Bad password')
            }
        }
        channel.users.push(user);
        //if user in invited, remove user
        return await this.channelRepository.save(channel);
    }

    async inviteToGame(user: User, userId: number, channelId: number)   {
       
    }
 
    async inviteToPrivate(user: User, userId: number, channelId: number) {
 
    }
 
    async passwordService(passInfo: ChannelPasswordDto)   {
        const channel = await this.getChannel(passInfo.cId, []);
        if (channel.hash?.length)    {
            if (!(passInfo.oldPass))    {
                throw new BadRequestException('No password provided')
            }   else    {
                const passMatch = await bcrypt.compare(passInfo.oldPass, channel.hash);
                if (!passMatch) {
                    throw new BadRequestException('Bad password');
                }
            }
        }
        if (!(passInfo.newPass) || !(passInfo.newPass?.length)) {
            channel.protected = false;
            channel.hash = null;
        }   else    {
            const hash = await bcrypt.hash(passInfo.newPass, SALT_ROUNDS);
            channel.hash = hash;
            channel.protected = true;
        }
        console.log('passwordService updated channel before save:', channel);
        await this.channelRepository.save(channel);
        return (channel);
    }

    async   saveChannel(channel: Channel) {
        return await this.channelRepository.save(channel);
    }

    async   createPrivate(u1: User, u2: User): Promise<Channel> {
        const room  = this.channelRepository.create({
            private: true,
            type: 'direct'
        });
        room.users = [u1, u2];
        room.messages = [];
        return await this.channelRepository.save(room);
    }

    async getPrivate(u1: User, u2: User): Promise<Channel[]>  {
        // console.log(u1.id, u2.id)
        const userIds = [u1.id, u2.id].sort();
        console.log(userIds)
        const room = await this.channelRepository
            /*
            .createQueryBuilder('channel')
            .leftJoinAndSelect('channel.users', 'users')
            // .where('users.id = :userId', {userId: u2.id})
            .where('users.id IN (:userIds)', {userIds)
            // .andWhere("channel.name IS NULL")
            // .groupBy('channel.id')
            // .having('COUNT(channel.id) = 2')
            .getMany();
            */
           .createQueryBuilder('channel')
           .innerJoin('channel.users', 'users')
           .where('users.id IN (:...userIds)', {userIds})
           .andWhere("channel.name IS NULL")
           .getMany()
            // .getOne();
        return room;

    }
}
