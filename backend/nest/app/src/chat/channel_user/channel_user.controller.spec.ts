import { Test, TestingModule } from '@nestjs/testing';
import { ChannelUserController } from './channel_user.controller';
import { ChannelUserService } from './channel_user.service';

describe('ChannelUserController', () => {
  let controller: ChannelUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChannelUserController],
      providers: [ChannelUserService],
    }).compile();

    controller = module.get<ChannelUserController>(ChannelUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
