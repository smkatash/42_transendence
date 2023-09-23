import { Module } from '@nestjs/common';
import { FriendListService } from './friend_list.service';
import { FriendListController } from './friend_list.controller';

@Module({
  controllers: [FriendListController],
  providers: [FriendListService]
})
export class FriendListModule {}
