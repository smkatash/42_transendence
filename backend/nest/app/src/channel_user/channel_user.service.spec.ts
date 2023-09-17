import { Test, TestingModule } from '@nestjs/testing';
import { ChannelUserService } from './channel_user.service';

describe('ChannelUserService', () => {
  let service: ChannelUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChannelUserService],
    }).compile();

    service = module.get<ChannelUserService>(ChannelUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
