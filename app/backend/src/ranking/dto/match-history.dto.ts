import { IsNumber, IsString } from "class-validator";
import { Match } from "src/game/entities/match.entity";
import { User } from "src/user/entities/user.entity";

const defeat = "DEFEAT";
const victory = "VICTORY";
type matchResult = typeof defeat | typeof victory;

export class MatchHistoryDto {
  @IsString()
  matchId: string;
  matchResult: matchResult;

  currentUser: User;
  @IsNumber()
  currentUserScore: number;

  opponentUser: User;
  @IsNumber()
  opponentUserScore: number;

  constructor(match: Match, userId: string) {
    this.matchId = match.id;
    if (userId === match.loser.id) {
      this.currentUser = match.loser.user;
      this.matchResult = defeat;
      this.opponentUser = match.winner.user;
    }
    if (userId === match.winner.id) {
      this.currentUser = match.winner.user;
      this.matchResult = victory;
      this.opponentUser = match.loser.user;
    }
    this.currentUserScore = match.scores[this.currentUser.id];
    this.opponentUserScore = match.scores[this.opponentUser.id];
  }
}
