import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatUser } from '../entities/chatUser.entity';
import { Repository } from 'typeorm';
// import { ChatUserInterface } from '../dto/chatUser.interface';
// import { UserInterface } from '../dto/user.interface';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ChatUserService {
    constructor(
        @InjectRepository(ChatUser)
        private readonly chatUserRepo: Repository<ChatUser>
    ){}

    // async create(chatUser: ChatUserInterface): Promise<ChatUserInterface>{
        // return await this.chatUserRepo.save(chatUser);
    // }
    async create(user: User, socketId: string): Promise<ChatUser>{
        const chatUser: ChatUser = new ChatUser();
        chatUser.socketId = socketId;
        chatUser.user = user;
        return await this.chatUserRepo.save(chatUser);
    }

    //ONLY ONE LOGIN!!
    async findByUser(user: User): Promise<ChatUser>{
        return await this.chatUserRepo.findOne({
            where:  {
                user: {
                    id: user.id
                }
            }
        })
    }

    async   deleteBySocketId(socketId: string)  {
        return await this.chatUserRepo.delete({socketId})
    }

    async deleteAll()   {
        await this.chatUserRepo
        .createQueryBuilder()
        .delete()
        .execute()
    }

    async getAll()  {
        return await this.chatUserRepo.find({
            relations:  [
                'user'
            ]
        });
    }
}
