import { Test, TestingModule } from '@nestjs/testing';
import { ChatUserService } from './chat-user.service';

describe('ChatUserService', () => {
  let service: ChatUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatUserService],
    }).compile();

    service = module.get<ChatUserService>(ChatUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
