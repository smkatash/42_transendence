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

    async getUserPosition(id: string) {
		const users = await this.getAllUserStats() 
		const position = users.findIndex(user => user.id === id)
		if (position === -1) {
			return position
		}
		return position + 1
	}

	async getUserStatsById(id: string) {
		const userMatches = await this.getMatchesByUserId(id)
		let wins = 0
		let losses = 0

		for (const match of userMatches) {
			if (match.winner.id === id) {
				wins += 1
			} else {
				losses += 1
			}
		}

		return { wins, losses }
	}
}
