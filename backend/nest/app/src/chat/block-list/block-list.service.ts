import { Injectable } from '@nestjs/common';
import { CreateBlockListDto } from './dto/create-block-list.dto';
import { UpdateBlockListDto } from './dto/update-block-list.dto';

@Injectable()
export class BlockListService {
  create(createBlockListDto: CreateBlockListDto) {
    return 'This action adds a new blockList';
  }

  findAll() {
    return `This action returns all blockList`;
  }

  findOne(id: number) {
    return `This action returns a #${id} blockList`;
  }

  update(id: number, updateBlockListDto: UpdateBlockListDto) {
    return `This action updates a #${id} blockList`;
  }

  remove(id: number) {
    return `This action removes a #${id} blockList`;
  }
}
