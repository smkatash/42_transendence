import { IsString, IsNotEmpty } from "class-validator";

export class UpdateUsernameDto {
  @IsString()
  @IsNotEmpty()
  username: string;
}

export class UpdateTitleDto {
  @IsString()
  @IsNotEmpty()
  title: string;
}

export class UpdateEmailDto {
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class ParamAvatarDto {
  @IsString()
  @IsNotEmpty()
  avatar: string;
}

export class ParamUserIdDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class FriendIdDto {
  @IsString()
  @IsNotEmpty()
  friendId: string;
}

export class BlockUserDto {
  @IsString()
  @IsNotEmpty()
  blockId: string;
}

export class UnblockUserDto {
  @IsString()
  @IsNotEmpty()
  unblockId: string;
}
