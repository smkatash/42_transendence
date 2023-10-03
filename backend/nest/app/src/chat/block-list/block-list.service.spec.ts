import { Test, TestingModule } from '@nestjs/testing';
import { BlockListService } from './block-list.service';

describe('BlockListService', () => {
  let service: BlockListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockListService],
    }).compile();

    service = module.get<BlockListService>(BlockListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
