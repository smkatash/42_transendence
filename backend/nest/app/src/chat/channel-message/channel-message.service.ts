import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChannelMessageDto } from './dto/create-channel-message.dto';
import { UpdateChannelMessageDto } from './dto/update-channel-message.dto';
import { ChannelMessage } from './entities/channel-message.entity';

@Injectable()
export class ChannelMessageService {
  constructor(@InjectRepository(ChannelMessage) private channelMessageRepo: Repository<ChannelMessage>) {}
 
  create(createChannelMessageDto: CreateChannelMessageDto) {
    return 'This action adds a new channelMessage';
  }

  findAll() {
    return `This action returns all channelMessage`;
  }

  findOne(id: number) {
    return `This action returns a #${id} channelMessage`;
  }

  update(id: number, updateChannelMessageDto: UpdateChannelMessageDto) {
    return `This action updates a #${id} channelMessage`;
  }

  remove(id: number) {
    return `This action removes a #${id} channelMessage`;
  }
}
