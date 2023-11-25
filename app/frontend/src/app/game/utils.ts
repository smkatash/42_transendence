// utils.ts
import { JoinMatchDto, PositionDto, GameModeDto } from '../entities.interface';


export async function waitOneSecond() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // console.log("...");
  }

export class GameServiceUtils {


	public static createMatchInfoDto(ID:string, level:number) {
		const matchInfo : JoinMatchDto = {
		  matchId: ID,
		  mode: level
		}
		return matchInfo;
	}

	public static createPaddleDto(value: string) {
		const retValue: PositionDto = {
		  step: value
		}
		return retValue;
	  }

	public static createGameDto(level: number) {
		const gameMode: GameModeDto = {
		  mode: level
		};
		return gameMode
	}
}
