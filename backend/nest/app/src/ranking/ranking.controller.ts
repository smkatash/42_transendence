import { Controller, Get, HttpException, Inject, Param, UnauthorizedException, UseGuards } from '@nestjs/common';
import { RankingService } from './ranking.service';
import { GetUser } from 'src/auth/utils/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { SessionGuard } from 'src/auth/guard/auth.guard';
import { MatchHistoryDto } from './dto/match-history.dto';
import { Match } from 'src/game/entities/match.entity';
import { StatsDto } from './dto/stats.dto';
import { SessionUserDto } from 'src/user/utils/user.dto';
import { ParamUserIdDto } from 'src/user/utils/entity.dto';

@Controller('ranking')
export class RankingController {
    constructor(@Inject(RankingService) private rankingService: RankingService) {}
    
    @Get('history')
    @UseGuards(SessionGuard)
    async getCurrentMatchHistory(@GetUser() currentUser: SessionUserDto) {
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
    async getUserMatchHistory(@Param() userIdDto: ParamUserIdDto, @GetUser() currentUser: SessionUserDto) {
        if (currentUser && currentUser.id && userIdDto.id) {
            const matchSummary: Match[] = await this.rankingService.getMatchesByUserId(userIdDto.id)
            const matchHistory: MatchHistoryDto[] = []
            
           for (const match of matchSummary) {
                matchHistory.push(new MatchHistoryDto(match, userIdDto.id))
           }
           return matchHistory
        }
        throw new UnauthorizedException('Access denied')
    }

    @Get('board')
    @UseGuards(SessionGuard)
    async getRankingBoard(@GetUser() currentUser: SessionUserDto) {
        if (currentUser && currentUser.id) {
            return this.rankingService.getAllUserStats()
        }
        throw new UnauthorizedException('Access denied')
		
    }
	
	@Get('level')
	@UseGuards(SessionGuard)
	async getCurrentPosition(@GetUser() currentUser: SessionUserDto) {
		if (currentUser && currentUser.id) {
			return this.rankingService.getUserPosition(currentUser.id)
		}
		throw new UnauthorizedException('Access denied')
	}

    @Get(':id/level')
	@UseGuards(SessionGuard)
	async getUserPosition(@Param() userIdDto: ParamUserIdDto, @GetUser() currentUser: SessionUserDto) {
		if (currentUser && currentUser.id && userIdDto.id) {
			return this.rankingService.getUserPosition(userIdDto.id)
		}
		throw new UnauthorizedException('Access denied')
	}

	@Get('stats')
	@UseGuards(SessionGuard)
	async getCurrentStats(@GetUser() currentUser: SessionUserDto) {
		if (currentUser && currentUser.id) {
			const stats: StatsDto = await this.rankingService.getUserStatsById(currentUser.id)
			return stats
		}
		throw new UnauthorizedException('Access denied')
	}

    @Get(':id/stats')
	@UseGuards(SessionGuard)
	async getUserStats(@Param() userIdDto: ParamUserIdDto, @GetUser() currentUser: SessionUserDto) {
		if (currentUser && currentUser.id && userIdDto.id) {
			const stats: StatsDto = await this.rankingService.getUserStatsById(userIdDto.id)
			return stats
		}
		throw new UnauthorizedException('Access denied')
	}
}
