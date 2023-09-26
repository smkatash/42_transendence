import { Injectable } from '@nestjs/common';
import { CreateChannelUserDto } from './dto/create-channel_user.dto';
import { UpdateChannelUserDto } from './dto/update-channel_user.dto';

@Injectable()
export class ChannelUserService {
  create(createChannelUserDto: CreateChannelUserDto) {
    return 'This action adds a new channelUser';
  }

  findAll() {
    return `This action returns all channelUser`;
  }

  findOne(id: number) {
    return `This action returns a #${id} channelUser`;
  }

  update(id: number, updateChannelUserDto: UpdateChannelUserDto) {
    return `This action updates a #${id} channelUser`;
  }

  remove(id: number) {
    return `This action removes a #${id} channelUser`;
  }
}
