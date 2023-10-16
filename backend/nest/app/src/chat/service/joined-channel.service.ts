import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { JoinedChannel } from "../entities/joinedChannel.entity";
import { Repository } from "typeorm";
import { Channel } from "../entities/channel.entity";
import { User } from "src/user/entities/user.entity";

@Injectable()
export class JoinedChannelService {
    constructor(
        @InjectRepository(JoinedChannel)
        private readonly    joinedChannelRepo: Repository<JoinedChannel>
    ){}

    async create(user: User, socketID: string, channel: Channel): Promise<JoinedChannel>  {
        const joinedCHannel = this.joinedChannelRepo.create({user, socketID, channel})
        return await this.joinedChannelRepo.save(joinedCHannel)
    }

    async findByUser(user: User): Promise<JoinedChannel[]>  {
        return await this.joinedChannelRepo.find({
            where:  {
                user
            }
        })
    }

    async findByChannel(channel: Channel): Promise<JoinedChannel[]>  {
        return await this.joinedChannelRepo.find({
            where: {
                channel
            }
        })
    }

    async deleteBySocketId(socketId: string)  {
        return await this.joinedChannelRepo.delete(socketId);
    }

    async purge() {
        return await this.joinedChannelRepo
        .createQueryBuilder()
        .delete()
        .execute();
    }
}