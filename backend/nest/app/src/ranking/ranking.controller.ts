import { Controller, Get, HttpException, Inject, UnauthorizedException, UseGuards } from '@nestjs/common';
import { RankingService } from './ranking.service';
import { GetUser } from 'src/auth/utils/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { SessionGuard } from 'src/auth/guard/auth.guard';
import { MatchHistoryDto } from './dto/match-history.dto';
import { Match } from 'src/game/entities/match.entity';
import { StatsDto } from './dto/stats.dto';

@Controller('ranking')
export class RankingController {
    constructor(@Inject(RankingService) private rankingService: RankingService) {}
    
    @Get('history')
    @UseGuards(SessionGuard)
    async getMatchHistory(@GetUser() user: User) {
        if (user && user.id) {
            const matchSummary: Match[] = await this.rankingService.getMatchesByUserId(user.id)
            const matchHistory: MatchHistoryDto[] = []
            
           for (const match of matchSummary) {
                matchHistory.push(new MatchHistoryDto(match, user.id))
           }
           return matchHistory
        }
        throw new UnauthorizedException('Access denied')
    }

    @Get('board')
    @UseGuards(SessionGuard)
    async getRankingBoard(@GetUser() user: User) {
        if (user && user.id) {
            return this.rankingService.getAllUserStats()
        }
        throw new UnauthorizedException('Access denied')
		
    }
	
	@Get(':id')
	@UseGuards(SessionGuard)
	async getUserPosition(@GetUser() user: User) {
		if (user && user.id) {
			return this.rankingService.getUserPosition(user.id)
		}
		throw new UnauthorizedException('Access denied')
	}

	@Get('stats')
	@UseGuards(SessionGuard)
	async get(@GetUser() user: User) {
		if (user && user.id) {
			const stats: StatsDto = await this.rankingService.getUserStatsById(user.id)
			return stats
		}
		throw new UnauthorizedException('Access denied')
	}
}
