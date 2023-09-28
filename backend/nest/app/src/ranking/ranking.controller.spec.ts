import { Test, TestingModule } from '@nestjs/testing';
import { RankingController } from './ranking.controller';

describe('RankingController', () => {
  let controller: RankingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RankingController],
    }).compile();

    controller = module.get<RankingController>(RankingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
