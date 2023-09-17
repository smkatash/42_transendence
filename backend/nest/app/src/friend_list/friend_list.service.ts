import { Injectable } from '@nestjs/common';
import { CreateFriendListDto } from './dto/create-friend_list.dto';
import { UpdateFriendListDto } from './dto/update-friend_list.dto';

@Injectable()
export class FriendListService {
  create(createFriendListDto: CreateFriendListDto) {
    return 'This action adds a new friendList';
  }

  findAll() {
    return `This action returns all friendList`;
  }

  findOne(id: number) {
    return `This action returns a #${id} friendList`;
  }

  update(id: number, updateFriendListDto: UpdateFriendListDto) {
    return `This action updates a #${id} friendList`;
  }

  remove(id: number) {
    return `This action removes a #${id} friendList`;
  }
}
