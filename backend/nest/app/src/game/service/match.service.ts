import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from '../entities/match.entity';
import { v4 } from 'uuid';
import { Game, GameState } from '../utls/game';
import { validate } from 'class-validator';
import { Player } from '../entities/player.entity';
import { PlayerService } from './player.service';
import { QueueService } from './queue.service';
import { Queue } from '../entities/queue.entity';
import { GameService } from './game.service';
import { Interval } from '@nestjs/schedule';
import { Player } from 'src/game/entities/player.entity';

@Injectable()
export class MatchService {
    matches: Map<string, Game> = new Map()

    constructor(@InjectRepository(Match) private matchRepo: Repository<Match>,
                private readonly playerService: PlayerService,
                private readonly queueService: QueueService,
                private readonly gameService: GameService) {}


     async waitInQueue(player: Player) {
        let queue: Queue = await this.queueService.getQueue()

        const playerIdsInQueue = queue.players.map((player) => player.id)
        if (!playerIdsInQueue.includes(player.id)) {
            console.log('Adding player to Queue')
            queue = await this.queueService.updatePlayersInQueue(player, queue)
        }
        return queue.players
    }

    async updateQueue(players: Player[]) {
        let queue: Queue = await this.queueService.getQueue()
        const playerIdsInQueue = queue.players.map((player) => player.id)
        for (const player of players) {
            if (playerIdsInQueue.includes(player.id)) {
                console.log('Removing from the Queue')
                queue = await this.queueService.removePlayerFromQueue(player)
            }
        }
        return queue.players
    }


    async joinMatch(player: Player, matchId: string): Promise<Game> {
       const match = await this.getCurrentMatch(matchId) 
        if (!match) return

        const newGame = this.gameService.launchGame()
        newGame.match = match
        this.matches.set(matchId, newGame)
        return newGame
    }

    async play(matchId: string) {
        const currentGame = this.matches.get(matchId)
        this.gameService.throwBall()
        
    }

    updatePlayerPosition(player: Player, step: number) {
        
    }


    async getCurrentMatch(matchId: string): Promise<Match> {
        return this.getMatchById(matchId)
    }

    getMatchById(id: string): Promise<Match> {
        return this.matchRepo.findOne({
            where: {id},
            relations: ['players']
        })
    }

    async makeAmatch(players: Player[]): Promise<Match> {
        const pair = this.getRandomPlayers(players, 2)
        const newMatch = await this.createMatch(pair)
        return newMatch
    }

    private getRandomPlayers(players: Player[], numberOfPlayersToSelect: number): Player[] {
        if (players.length === 2) {
            return players
        }
        const shuffledPlayers = players.slice().sort(() => Math.random() - 0.5)
        return shuffledPlayers.slice(0, numberOfPlayersToSelect)
    }


    async createMatch(players: Player[]): Promise<Match> {
        const match = this.matchRepo.create({
            id: v4(),
            players: players,
            status: GameState.READY
        })
        return this.saveValidMatch(match)
    }


    async saveValidMatch(match: Match) {
        const validate_error = await validate(match)
        if (validate_error.length > 0) {
          throw new BadRequestException()
        }
        return this.matchRepo.save(match)
    }

  

}


