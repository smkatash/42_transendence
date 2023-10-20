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
        console.log(channel);
        return await this.joinedChannelRepo.find({
            relations: ['channel'],
            where: {
                channel: {id: channel.id}
            }
        })
    }

    async deleteBySocketId(socketId: string, channel: Channel)  {
        return await this.joinedChannelRepo.delete({
            socketID: socketId,
            channel: {
                id: channel.id
            }
        });
    }

    async deleteByUserChannel(user: User, channel: Channel)    {
        return await this.joinedChannelRepo.delete({
            // user: user,
            // channel: channel
            user: {
                id: user.id
            },
            channel: {
                id: channel.id
            }
        })
    }

    async purge() {
        return await this.joinedChannelRepo
        .createQueryBuilder()
        .delete()
        .execute();
    }

    async updateSocket(conn: JoinedChannel)    {
        await this.joinedChannelRepo.save(conn)
    }
}