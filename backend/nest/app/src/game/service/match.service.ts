import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from '../entities/match.entity';
import { v4 } from 'uuid';
import { GameStatus, Player } from '../utls/game';
import { validate } from 'class-validator';

@Injectable()
export class MatchService {
    constructor(@InjectRepository(Match) private matchRepo: Repository<Match>) {}

    //TODO find a solution for sockets!
    async joinMatch(player: Player, match: Match): Promise<void> {
        if (match.status === GameStatus.WAITING && 
            match.players.length < 2)  {
            //match.players.push(player)

            if ((match.players.length as number) === 2) {
                match.status = GameStatus.START
            }
        } else {
            //match.observers.push(player)
        }
        await this.saveValidMatch(match)
    }


    async createMatch(): Promise<Match> {
        const match = this.matchRepo.create({id: v4()})
        return this.matchRepo.save(match)
    }

    async saveValidMatch(match: Match) {
        const validate_error = await validate(match)
        if (validate_error.length > 0) {
          throw new BadRequestException()
        }
        return this.matchRepo.save(match)
      }


    getMatchById(id: string): Promise<Match> {
        return this.matchRepo.findOneBy({id})
    }

    async getCurrentMatch(matchId?: string): Promise<Match> {
        let match: Match

        if (matchId) {
            match = await this.getMatchById(matchId)
        } else {
            match = await this.createMatch()
        }

        if (!match) {
            throw new InternalServerErrorException()
        }
        return match
    }
}
