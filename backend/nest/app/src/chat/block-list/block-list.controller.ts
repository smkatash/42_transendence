import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BlockListService } from './block-list.service';
import { CreateBlockListDto } from './dto/create-block-list.dto';
import { UpdateBlockListDto } from './dto/update-block-list.dto';

@Controller('block-list')
export class BlockListController {
  constructor(private readonly blockListService: BlockListService) {}

  @Post()
  create(@Body() createBlockListDto: CreateBlockListDto) {
    return this.blockListService.create(createBlockListDto);
  }

  @Get()
  findAll() {
    return this.blockListService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blockListService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlockListDto: UpdateBlockListDto) {
    return this.blockListService.update(+id, updateBlockListDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blockListService.remove(+id);
  }
}
