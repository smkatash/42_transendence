import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatUser } from '../entities/chatUser.entity';
import { Repository } from 'typeorm';
import { ChatUserInterface } from '../dto/chatUser.interface';
import { UserInterface } from '../dto/user.interface';

@Injectable()
export class ChatUserService {
    constructor(
        @InjectRepository(ChatUser)
        private readonly chatUserRepo: Repository<ChatUser>
    ){}

    async create(chatUser: ChatUserInterface): Promise<ChatUserInterface>{
        return await this.chatUserRepo.save(chatUser);
    }

    async findByUser(user: UserInterface): Promise<ChatUserInterface[]>{
        return await this.chatUserRepo.find({where: {user}})//???
    }

    async   deleteBySocketId(socketId: string)  {
        return await this.chatUserRepo.delete({socketId})
    }
}
