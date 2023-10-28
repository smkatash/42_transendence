import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { GameMode } from "./game";

export class JoinMatchDto {
	@IsString()
  	@IsNotEmpty()
    matchId: string

	@IsNumber()
  	@IsNotEmpty()
    mode: GameMode
}

export class PositionDto {
	@IsString()
  	@IsNotEmpty()
    step: string
}

export class InvitedUserDto {
	@IsString()
  	@IsNotEmpty()
    userId: string
}

export class GameModeDto {
	@IsNumber()
  	@IsNotEmpty()
    mode: GameMode
}