import { Controller, Get, HttpException, Inject, Param, UnauthorizedException, UseGuards } from '@nestjs/common';
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
    async getCurrentMatchHistory(@GetUser() currentUser: User) {
        if (currentUser && currentUser.id) {
            const matchSummary: Match[] = await this.rankingService.getMatchesByUserId(currentUser.id)
            const matchHistory: MatchHistoryDto[] = []
            
           for (const match of matchSummary) {
                matchHistory.push(new MatchHistoryDto(match, currentUser.id))
           }
           return matchHistory
        }
        throw new UnauthorizedException('Access denied')
    }

    @Get(':id/history')
    @UseGuards(SessionGuard)
    async getUserMatchHistory(@Param('id') userId: string, @GetUser() currentUser: User) {
        if (currentUser && currentUser.id && userId) {
            const matchSummary: Match[] = await this.rankingService.getMatchesByUserId(userId)
            const matchHistory: MatchHistoryDto[] = []
            
           for (const match of matchSummary) {
                matchHistory.push(new MatchHistoryDto(match, userId))
           }
           return matchHistory
        }
        throw new UnauthorizedException('Access denied')
    }

    @Get('board')
    @UseGuards(SessionGuard)
    async getRankingBoard(@GetUser() currentUser: User) {
        if (currentUser && currentUser.id) {
            return this.rankingService.getAllUserStats()
        }
        throw new UnauthorizedException('Access denied')
		
    }
	
	@Get('level')
	@UseGuards(SessionGuard)
	async getCurrentPosition(@GetUser() currentUser: User) {
		if (currentUser && currentUser.id) {
			return this.rankingService.getUserPosition(currentUser.id)
		}
		throw new UnauthorizedException('Access denied')
	}

    @Get(':id/level')
	@UseGuards(SessionGuard)
	async getUserPosition(@Param('id') userId: string, @GetUser() currentUser: User) {
		if (currentUser && currentUser.id && userId) {
			return this.rankingService.getUserPosition(userId)
		}
		throw new UnauthorizedException('Access denied')
	}

	@Get('stats')
	@UseGuards(SessionGuard)
	async getCurrentStats(@GetUser() currentUser: User) {
		if (currentUser && currentUser.id) {
			const stats: StatsDto = await this.rankingService.getUserStatsById(currentUser.id)
			return stats
		}
		throw new UnauthorizedException('Access denied')
	}

    @Get(':id/stats')
	@UseGuards(SessionGuard)
	async getUserStats(@Param('id') userId: string, @GetUser() currentUser: User) {
		if (currentUser && currentUser.id && userId) {
			const stats: StatsDto = await this.rankingService.getUserStatsById(userId)
			return stats
		}
		throw new UnauthorizedException('Access denied')
	}
}
