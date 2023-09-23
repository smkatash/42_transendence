import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChannelUserService } from './channel_user.service';
import { CreateChannelUserDto } from './dto/create-channel_user.dto';
import { UpdateChannelUserDto } from './dto/update-channel_user.dto';

@Controller('channel-user')
export class ChannelUserController {
  constructor(private readonly channelUserService: ChannelUserService) {}

  @Post()
  create(@Body() createChannelUserDto: CreateChannelUserDto) {
    return this.channelUserService.create(createChannelUserDto);
  }

  @Get()
  findAll() {
    return this.channelUserService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.channelUserService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChannelUserDto: UpdateChannelUserDto) {
    return this.channelUserService.update(+id, updateChannelUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.channelUserService.remove(+id);
  }
}
