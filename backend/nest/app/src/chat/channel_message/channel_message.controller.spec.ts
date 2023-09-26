import { Test, TestingModule } from '@nestjs/testing';
import { ChannelMessageController } from './channel_message.controller';
import { ChannelMessageService } from './channel_message.service';

describe('ChannelMessageController', () => {
  let controller: ChannelMessageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChannelMessageController],
      providers: [ChannelMessageService],
    }).compile();

    controller = module.get<ChannelMessageController>(ChannelMessageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
