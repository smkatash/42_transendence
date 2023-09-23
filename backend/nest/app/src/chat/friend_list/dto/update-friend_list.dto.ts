import { PartialType } from '@nestjs/mapped-types';
import { CreateFriendListDto } from './create-friend_list.dto';

export class UpdateFriendListDto extends PartialType(CreateFriendListDto) {}
