import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from '../entities/message.entity';
import { Repository } from 'typeorm';
import { CreateMessageDto } from '../dto/createMessage.dto';
import { Channel } from '../entities/channel.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class MessageService {
    constructor(
        @InjectRepository(Message)
        private readonly msgRepo: Repository<Message>
    ){}

    async   newMessage(content: string, user: User, channel: Channel): Promise<Message>   {
        const msg = this.msgRepo.create({
            content,
            user,
            channel
        });
        return await this.msgRepo.save(msg);
    }

    //wtf
    // async findMessagesByChannel(channel:  Channel): Promise<Message[]>  {
    //     return await this.msgRepo.find({
    //         where:  {
    //             channel
    //         },
    //         relations: ['user', 'channel'],
    //         order:  {
    //             createdAt: "ASC"
    //         }
    //     })
    // }

    async findMessagesForChannel(channel: Channel)  {
        // const query = this.msgRepo
        //     .createQueryBuilder('message')
        //     .leftJoin('message.channel', 'channel')
        //     .where('channel.id = :channelId', {channelId: channel.id})
        //     .leftJoinAndSelect('message.user', 'user')
        //     .orderBy('message.createdAt', 'ASC')
        //     .execute()
        // return query
        return await this.msgRepo.find({
            where:  {
                channel: {
                    id: channel.id
                }
            },
            relations:  [
                'user'
            ]
        })
    }

    async purge()   {
        return await this.msgRepo
            .createQueryBuilder()
            .delete()
            .execute()
    }
}
