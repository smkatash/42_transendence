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
    private readonly joinedChannelRepo: Repository<JoinedChannel>,
  ) {}

  async create(user: User, socketId: string, channel: Channel): Promise<JoinedChannel> {
    const joinedCHannel = this.joinedChannelRepo.create({ user, socketId, channel });
    return await this.joinedChannelRepo.save(joinedCHannel);
  }

  async findByUser(user: User): Promise<JoinedChannel[]> {
    return await this.joinedChannelRepo.find({
      where: {
        user: {
          id: user.id,
        },
      },
      relations: ["channel", "user"],
    });
  }

  async findByChannel(channel: Channel): Promise<JoinedChannel[]> {
    return await this.joinedChannelRepo.find({
      relations: ["channel", "user"],
      where: {
        channel: { id: channel.id },
      },
    });
  }

  async deleteBySocketId(socketId: string, channel: Channel) {
    return await this.joinedChannelRepo.delete({
      socketId: socketId,
      channel: {
        id: channel.id,
      },
    });
  }

    async findByChannelUser (channel: Channel, user: User)   {
        return  await this.joinedChannelRepo.findOne({
            where:  {
                channel: {
                    id: channel.id
                },
                user: {
                    id: user.id
                }
            }
        })
    }
    async deleteByUserChannel(user: User, channel: Channel)    {
        return await this.joinedChannelRepo.delete({
            user: {
                id: user.id
            },
            channel: {
                id: channel.id
            }
        })
    }

  async deleteByChannel(channel: Channel) {
    return await this.joinedChannelRepo.delete({
      channel: {
        id: channel.id,
      },
    });
  }

  async purge() {
    return await this.joinedChannelRepo.createQueryBuilder().delete().execute();
  }

  async updateSocket(conn: JoinedChannel) {
    return await this.joinedChannelRepo.save(conn);
  }
}
