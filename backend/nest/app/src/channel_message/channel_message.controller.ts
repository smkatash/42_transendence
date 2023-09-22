import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChannelMessageService } from './channel_message.service';
import { CreateChannelMessageDto } from './dto/create-channel_message.dto';
import { UpdateChannelMessageDto } from './dto/update-channel_message.dto';

@Controller('channel-message')
export class ChannelMessageController {
  constructor(private readonly channelMessageService: ChannelMessageService) {}

  @Post()
  create(@Body() createChannelMessageDto: CreateChannelMessageDto) {
    return this.channelMessageService.create(createChannelMessageDto);
  }

  @Get()
  findAll() {
    return this.channelMessageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.channelMessageService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChannelMessageDto: UpdateChannelMessageDto) {
    return this.channelMessageService.update(+id, updateChannelMessageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.channelMessageService.remove(+id);
  }
}
