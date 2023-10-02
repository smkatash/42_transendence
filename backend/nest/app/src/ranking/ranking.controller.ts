import { Controller, Get, HttpException, Inject, UnauthorizedException, UseGuards } from '@nestjs/common';
import { RankingService } from './ranking.service';
import { GetUser } from 'src/auth/utils/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { SessionGuard } from 'src/auth/guard/auth.guard';
import { MatchHistoryDto } from './dto/match-history.dto';
import { Match } from 'src/game/entities/match.entity';

@Controller('ranking')
export class RankingController {
    constructor(@Inject(RankingService) private rankingService: RankingService) {}
    
    @Get('user')
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
}
