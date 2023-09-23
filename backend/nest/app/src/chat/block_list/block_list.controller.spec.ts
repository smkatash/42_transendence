import { Test, TestingModule } from '@nestjs/testing';
import { BlockListController } from './block_list.controller';
import { BlockListService } from './block_list.service';

describe('BlockListController', () => {
  let controller: BlockListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlockListController],
      providers: [BlockListService],
    }).compile();

    controller = module.get<BlockListController>(BlockListController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
