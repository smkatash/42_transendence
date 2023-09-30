import { Injectable } from '@nestjs/common';
import { Match } from 'src/game/entities/match.entity';
import { MatchService } from 'src/game/service/match.service';
import { PlayerService } from 'src/game/service/player.service';

@Injectable()
export class RankingService {

    constructor(private readonly matchService: MatchService,
                private readonly playerService: PlayerService) {}


    async getMatchesByUserId(userId: string): Promise<Match[]> {
        return this.matchService.getMatchesByPlayerId(userId)
    }

    async getAllUserStats() {
        const users = await this.playerService.getPlayers()
        users.sort((a, b) => a.score - b.score)
        return users
    }

    
}
