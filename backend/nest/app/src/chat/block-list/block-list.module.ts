import { Module } from '@nestjs/common';
import { BlockListService } from './block-list.service';
import { BlockListController } from './block-list.controller';

@Module({
  controllers: [BlockListController],
  providers: [BlockListService],
})
export class BlockListModule {}
