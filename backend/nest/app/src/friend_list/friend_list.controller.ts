import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FriendListService } from './friend_list.service';
import { CreateFriendListDto } from './dto/create-friend_list.dto';
import { UpdateFriendListDto } from './dto/update-friend_list.dto';

@Controller('friend-list')
export class FriendListController {
  constructor(private readonly friendListService: FriendListService) {}

  @Post()
  create(@Body() createFriendListDto: CreateFriendListDto) {
    return this.friendListService.create(createFriendListDto);
  }

  @Get()
  findAll() {
    return this.friendListService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.friendListService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFriendListDto: UpdateFriendListDto) {
    return this.friendListService.update(+id, updateFriendListDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.friendListService.remove(+id);
  }
}
