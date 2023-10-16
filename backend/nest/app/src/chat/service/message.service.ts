import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from '../entities/message.entity';
import { Repository } from 'typeorm';
import { CreateMessageDto } from '../dto/createMessage.dto';
import { Channel } from '../entities/channel.entity';

@Injectable()
export class MessageService {
    constructor(
        @InjectRepository(Message)
        private readonly msgRepo: Repository<Message>
    ){}

    async   newMessage(msgInfo: CreateMessageDto): Promise<Message>   {
        const msg = this.msgRepo.create(msgInfo);
        return await this.msgRepo.save(msg);
    }

    async findMessagesByChannel(channel:  Channel): Promise<Message[]>  {
        return await this.msgRepo.find({
            where:  {
                channel
            },
            relations: ['user', 'channel']
        })
    }

}
