import { Test, TestingModule } from '@nestjs/testing';
import { FriendListService } from './friend_list.service';

describe('FriendListService', () => {
  let service: FriendListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FriendListService],
    }).compile();

    service = module.get<FriendListService>(FriendListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
