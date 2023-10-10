import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from '../entities/channel.entity';
import { createChannelDto } from '../dto/createChannel.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ChannelService {
    constructor(
        @InjectRepository(Channel)
        private readonly channelRepository: Repository<Channel>
        ){
    }

    async createChannel(channel: createChannelDto, owner: User): Promise<Channel>{
        try {
            const newChannel = this.channelRepository.create(channel);
            newChannel.owner = owner;
            newChannel.users.push(owner);
            return await this.channelRepository.save(newChannel);
        } catch (error) {
            Logger.error(error);
            throw new HttpException('channel already exists', HttpStatus.BAD_REQUEST)
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
}
