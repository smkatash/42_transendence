import { BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from '../entities/match.entity';
import { v4 } from 'uuid';
import { Game, GameMode, GameState } from '../utls/game';
import { validate } from 'class-validator';
import { Player } from '../entities/player.entity';
import { PlayerService } from './player.service';
import { PlayerQueueService} from './queue.service';
import { GameService } from './game.service';
import { Interval } from '@nestjs/schedule';
import { Server } from 'socket.io';
import { INGAME } from '../utls/rooms';
import { Status } from 'src/user/utils/status.enum';


@Injectable()
export class MatchService {
    private matches: Map<string, Game> = new Map()
    private server: Server
	private currentPlayerId: string

    constructor(@InjectRepository(Match) private matchRepo: Repository<Match>,
                private readonly gameService: GameService,
                private readonly playerService: PlayerService,
				private readonly queueService: PlayerQueueService
                ) {}

	async waitInPlayerQueue(player: Player, mode: GameMode) {
		const matchId = this.queueService.isEnqueuedInMatch(player.id)
		if (matchId) {
			console.log("player has a match")
			const match = await this.getMatchById(matchId)
			return match
		} else {
			if (!this.queueService.isInQueue(player.id, mode)) {
				console.log("adding player to queue")
				this.queueService.enqueue(player.id, mode)
			}
		}
		if (this.queueService.isQueueReady(mode)) {
			console.log("removing player fro, queue")
			const pair =  this.queueService.dequeue(mode)
			const newMatch = await this.makeAmatch(player.id, pair)
			return newMatch
		}
		return undefined
    }

	leaveAllQueues(playerId: string) {
		this.queueService.dequeuePlayer(playerId)
	}


    async joinMatch(matchId: string, mode: GameMode): Promise<Game> {
       const match = await this.getMatchById(matchId)
        if (!match) throw new NotFoundException()
		
		this.queueService.dequeueMatch(match.id)
        const newGame = this.gameService.launchGame(match, mode)
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
                    this.server.to(match.match.id).emit(INGAME, updateGame)
					console.log("END of GAME " + JSON.stringify(updateGame.match))
					this.server.in(match.match.id).disconnectSockets(true)
                    this.server.socketsLeave(match.match.id)
					this.matches.delete(match.match.id)
                }
                this.server.to(match.match.id).emit(INGAME, updateGame)
				await this.checkDisconnectedPlayers(match)
            } else if (match.status === GameState.PAUSE) {
				await this.saveMatchHistory(match)
                this.server.to(match.match.id).emit(INGAME, match)
				this.server.in(match.match.id).disconnectSockets(true)
                this.server.socketsLeave(match.match.id)
				this.matches.delete(match.match.id)
			}
        }
    }

    updatePlayerPosition(player: Player, step: number) {
       for (const match of this.matches.values()) {
            if (match.status === GameState.INPROGRESS) {
                console.log(step);
                // const index = match.match.players.findIndex(matchPlayer => matchPlayer.id === player.id)
                // if (index != -1 ) {
                //     if (index === 0 ) {
                         console.log(match.leftPaddle.position.y)
                        match.leftPaddle.position.y += step;
                        console.log(match.leftPaddle.position.y)
                    // } else {
                    //     match.rightPaddle.position.y += step
                    // }
                    return
                // }
            }
       }
    }   

	async checkDisconnectedPlayers(match: Game){
        if (match.match.players.length === 2) {
            const players = match.match.players
            const playerOne = await this.playerService.getUserByPlayerId(players[0].id)
            const playerTwo = await this.playerService.getUserByPlayerId(players[1].id)
            if (playerOne.user.status !== Status.GAME) {
                match.match.status = GameState.PAUSE
                match.match.loser = playerOne
                match.match.winner = playerTwo
            }
            if (playerTwo.user.status !== Status.GAME) {
                match.match.status = GameState.PAUSE
                match.match.loser = playerTwo
                match.match.winner = playerOne
            }
        }
	}


    getMatchById(id: string): Promise<Match> {
        return this.matchRepo.findOne({
            where: {id},
            relations: ['players']
        })
    }

    async makeAmatch(currentPlayerId: string, playersId: string[]): Promise<Match> {
		this.currentPlayerId = currentPlayerId

		const playerPromises = playersId.map(id => this.playerService.getPlayerById(id));
  		const pair = await Promise.all(playerPromises);
		const newMatch = await this.createMatch(pair)
		this.queueService.enqueueMatch(newMatch.id, playersId)
		return newMatch
    }


    async createMatch(players: Player[]): Promise<Match> {
        const match = this.matchRepo.create({
            id: v4(),
			currentPlayerId: this.currentPlayerId,
            players: players,
            status: GameState.READY
        })
        return this.saveValidMatch(match)
    }

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


