import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from '../entities/match.entity';
import { v4 } from 'uuid';
import { GameStatus } from '../utls/game';
import { validate } from 'class-validator';
import { Player } from '../entities/player.entity';
import { Queue } from '../entities/queue.entity';
import { PlayerService } from './player.service';

@Injectable()
export class MatchService {
    private readonly queueId = 'fifo'

    constructor(@InjectRepository(Match) private matchRepo: Repository<Match>,
                @InjectRepository(Queue) private queueRepo: Repository<Queue>,
                private readonly playerService: PlayerService) {}

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

    async getCurrentMatch(matchId: string): Promise<Match> {
        return this.getMatchById(matchId)
    }

    getMatchById(id: string): Promise<Match> {
        return this.matchRepo.findOneBy({id})
    }

    async makeAmatch(players: Player[]): Promise<Match | undefined> {
        let newMatch: Match | undefined

        if (players.length === 2) {
            newMatch = await this.createMatch(players)
        } else if (players.length > 2) {
            const playersSelected = this.getRandomPlayers(players, 2)
            newMatch =  await this.createMatch(playersSelected)
            playersSelected.forEach(player => {
                this.removerPlayerinQueue(player)
            })
        }
        return newMatch
    }

    private getRandomPlayers(players: Player[], numberOfPlayersToSelect: number): Player[] {
        const shuffledPlayers = players.slice().sort(() => Math.random() - 0.5)
        return shuffledPlayers.slice(0, numberOfPlayersToSelect)
    }

    async createMatch(players: Player[]): Promise<Match> {
        const match = this.matchRepo.create({
            id: v4(),
            players: players
        })
        return this.matchRepo.save(match)
    }

    async saveValidMatch(match: Match) {
        const validate_error = await validate(match)
        if (validate_error.length > 0) {
          throw new BadRequestException()
        }
        return this.matchRepo.save(match)
    }
        
    async setStatusInQueue(player: Player): Promise<Map<GameStatus, Player[]>> {
       let players = await this.getPlayersInQueue()
       if (players.length < 2) {
           await this.addPlayerToQueue(player)
           players = await this.getPlayersInQueue()
       }
       const status = players.length < 2 ? GameStatus.WAITING : GameStatus.START
       return new Map([[status, players]])
    }


    async addPlayerToQueue(player: Player) {
        const queue = await this.getQueue()
        this.playerService.updatePlayerQueue(player, queue)
    }

    async removerPlayerinQueue(player: Player) {
        const queue = await this.getQueue()
        this.playerService.updatePlayerQueue(player, null )
    }

    async getPlayersInQueue(): Promise<Player[]> {
        try {
            const queue = await this.getQueue()
            if (queue) {
                return this.playerService.getPlayersByQueue(queue)
            }
            throw new InternalServerErrorException()
        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }

    async getQueue(): Promise<Queue> {
        return this.queueRepo.findOneBy({id: this.queueId})
    }

}
