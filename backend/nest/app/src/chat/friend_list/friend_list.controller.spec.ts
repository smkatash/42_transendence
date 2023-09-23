import { Test, TestingModule } from '@nestjs/testing';
import { FriendListController } from './friend_list.controller';
import { FriendListService } from './friend_list.service';

describe('FriendListController', () => {
  let controller: FriendListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FriendListController],
      providers: [FriendListService],
    }).compile();

    controller = module.get<FriendListController>(FriendListController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
