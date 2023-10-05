import { BadRequestException, Injectable} from '@nestjs/common';
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
import { Server } from 'socket.io';


@Injectable()
export class MatchService {
    matches: Map<string, Game> = new Map()
    server: Server

    constructor(@InjectRepository(Match) private matchRepo: Repository<Match>,
                private readonly queueService: QueueService,
                private readonly gameService: GameService,
                private readonly playerService: PlayerService
                ) {}


     async waitInQueue(player: Player) {
        let queue: Queue = await this.queueService.getQueue()

        let playerIdsInQueue = []
        if (queue && queue.players) {
            playerIdsInQueue = queue.players.map((player) => player.id)
            if (!playerIdsInQueue.includes(player.id)) {
                console.log('Adding player to Queue')
                queue = await this.queueService.updatePlayersInQueue(player, queue)
            }
        } else {
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


    async joinMatch(matchId: string): Promise<Game> {
       const match = await this.getCurrentMatch(matchId) 
        if (!match) return

        const newGame = this.gameService.launchGame(match)
        this.matches.set(matchId, newGame)
        return newGame
    }

    getServer(server: Server) {
        this.server = server
    }

    @Interval(1000 / 60)
    async play() {
        for (const match of this.matches.values()) {
            if (match.status === GameState.INPROGRESS) {
                const updateGame = this.gameService.throwBall(match)
                if (updateGame.status === GameState.END) {
                    await this.saveMatchHistory(updateGame)
                    this.server.to(match.match.id).emit('play', updateGame)
                    this.server.socketsLeave(match.match.id)
                }
                this.server.to(match.match.id).emit('play', updateGame)
            }
        }
    }

    updatePlayerPosition(player: Player, step: number) {
       for (const match of this.matches.values()) {
            if (match.status === GameState.INPROGRESS) {
                const index = match.match.players.findIndex(matchPlayer => matchPlayer.id === player.id)
                if (index != -1 ) {
                    if (index === 0 ) {
                        match.leftPaddle.position.y += step
                    } else {
                        match.rightPaddle.position.y += step
                    }
                    return
                }
            }
       }
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

    // TODO check if scores and player match
    async saveMatchHistory(game: Game) {
        const match = game.match
        match.scores = game.scores
        await this.playerService.updatePlayerScore(game.match.players, game.scores)
        return this.saveValidMatch(match)
    } 


    async saveValidMatch(match: Match) {
        const validate_error = await validate(match)
        if (validate_error.length > 0) {
          throw new BadRequestException()
        }
        return this.matchRepo.save(match)
    }

    async getMatchesByPlayerId(id: string): Promise<Match[]> {
        return this.matchRepo
            .createQueryBuilder('match')
            .innerJoinAndSelect('match.players', 'players')
            .innerJoinAndSelect('match.winner', 'winner')
            .innerJoinAndSelect('match.loser', 'loser')
            .innerJoinAndSelect('winner.user', 'winnerUser')
            .innerJoinAndSelect('loser.user', 'loserUser')
            .where('players.id = :id', { id })
            .addSelect(['winnerUser.username'])
            .addSelect(['loserUser.username']) 
            .getMany()
    }
}


