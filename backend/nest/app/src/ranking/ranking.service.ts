import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Match } from 'src/game/entities/match.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RankingService {

    constructor(@InjectRepository(Match) private matchRepo: Repository<Match>) {}


    async getMatchesByUserId(userId: string): Promise<Match[]> {
        return this.matchRepo
            .createQueryBuilder('match')
            .innerJoinAndSelect('match.players', 'players')
            .innerJoinAndSelect('match.winner', 'winner')
            .innerJoinAndSelect('match.loser', 'loser')
            .innerJoinAndSelect('winner.user', 'winnerUser')
            .innerJoinAndSelect('loser.user', 'loserUser')
            .where('players.id = :userId', { userId })
            .addSelect(['winnerUser.username'])
            .addSelect(['loserUser.username']) 
            .getMany()
    }

    
}
