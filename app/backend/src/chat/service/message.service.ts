import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Message } from "../entities/message.entity";
import { Repository } from "typeorm";
import { CreateMessageDto } from "../dto/channel.dto";
import { Channel } from "../entities/channel.entity";
import { User } from "src/user/entities/user.entity";

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly msgRepo: Repository<Message>,
  ) {}

    async   newMessage(chan: Channel, autor: User,  msgInfo: CreateMessageDto): Promise<Message>   {
        const msg = this.msgRepo.create({
            channel: chan,
            user: autor,
            content: msgInfo.content,
            inviteId: msgInfo.inviteId,
            inviteType: msgInfo.inviteType
        });
        return await this.msgRepo.save(msg);
    }

    async findMessagesForChannel(channel: Channel)  {
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

  async purge() {
    return await this.msgRepo.createQueryBuilder().delete().execute();
  }

    async deleteByChannel(channel: Channel) {
        return await this.msgRepo.delete({
            channel: {
                id: channel.id
            }
        })
    }

    async findById(id: number)  {
        return await this.msgRepo.findOne({
            where:  {
                id: id
            },
            relations:  [
                'channel'
            ]
        })
    }

    async save(msg: Message)    {
        return await this.msgRepo.save(msg);
    }
}