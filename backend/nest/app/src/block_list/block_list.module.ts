import { Module } from '@nestjs/common';
import { BlockListService } from './block_list.service';
import { BlockListController } from './block_list.controller';

@Module({
  controllers: [BlockListController],
  providers: [BlockListService]
})
export class BlockListModule {}
