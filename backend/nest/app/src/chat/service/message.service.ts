import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from '../entities/message.entity';
import { Repository } from 'typeorm';
import { CreateMessageDto } from '../dto/createMessage.dto';

@Injectable()
export class MessageService {
    constructor(
        @InjectRepository(Message)
        private readonly msgRepo: Repository<Message>
    ){}

    async   newMessage(msgInfo: CreateMessageDto)   {
        const msg = this.msgRepo.create(msgInfo);
        return await this.msgRepo.save(msg);
    }
}
