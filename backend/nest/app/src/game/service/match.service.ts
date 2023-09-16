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
           players.forEach(async player => {
                await this.removerPlayerinQueue(player)
            })
            players = await this.getPlayersInQueue()
            console.log('after delete ' + JSON.stringify(players))
        } else if (players.length > 2) {
            const playersSelected = this.getRandomPlayers(players, 2)
            newMatch =  await this.createMatch(playersSelected)
            playersSelected.forEach(async player => {
                await this.removerPlayerinQueue(player)
            })
        }
        console.log('Match ' + JSON.stringify(newMatch))
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
           console.log('Adding to queue ' + players.length)
           await this.addPlayerToQueue(player)
           players = await this.getPlayersInQueue()
       }
       console.log('Length ' + players.length)
       const status = players.length < 2 ? GameStatus.WAITING : GameStatus.START
       return new Map([[status, players]])
    }


    async addPlayerToQueue(player: Player) {
        const queue = await this.getQueue()
        if (!queue.players) {
            queue.players = [player]
        } else {
            queue.players.push(player)
        }
        await this.queueRepo.save(queue)
        await this.playerService.updatePlayerQueue(player, queue)
    }

    async removerPlayerinQueue(player: Player) {
        return this.playerService.updatePlayerQueue(player, null)
    }

    async getPlayersInQueue(): Promise<Player[]> {
        try {
            const queue = await this.getQueue()
            if (queue) {
                return this.playerService.getPlayersByQueue(queue)
            }
        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }

    async getQueue(): Promise<Queue> {
        let queue = await this.queueRepo.findOneBy({id: this.queueId})
        if (!queue) {
            console.log('Created new queue')
            queue = await this.createQueue()
        }
        return queue
    }

    createQueue(): Promise<Queue> {
        const newQueue = this.queueRepo.create({
            id: this.queueId,
            players: null
        })
        return this.queueRepo.save(newQueue)
    }


}
