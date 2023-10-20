import { BadRequestException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate } from 'class-validator';
import { Player } from '../entities/player.entity';
import { User } from 'src/user/entities/user.entity';
import { GameState } from '../utls/game';
import { Queue } from '../entities/queue.entity';

@Injectable()
export class PlayerService {
    constructor(@InjectRepository(Player) private playerRepo: Repository<Player>) {}

    createPlayer(user: User, clientId: string): Promise<Player> {
        const newPlayer: Player = {
            id: user.id,
            user: user,
            clientId: clientId,
            score: 0,
            matches: [],
            queue: null,
            gameState: GameState.START
        }
        
        const player = this.playerRepo.create(newPlayer)
        return this.playerRepo.save(player)
    }

    async getPlayerById(id: string): Promise<Player> {
        return this.playerRepo.findOneBy({id})
    }


    async getPlayerByUser(user: User, clientId: string): Promise<Player> {
        const currentPlayer = await this.getPlayerById(user.id)
        if (currentPlayer) {
            return currentPlayer
        }

        return this.createPlayer(user, clientId)
    }

    async saveValidPlayer(player: Player) {
        const validate_error = await validate(player);
        if (validate_error.length > 0) {
            throw new UnprocessableEntityException('Invalid player format');
        }
        return this.playerRepo.save(player);
      }

    async updatePlayerClient(player: Player, clientId: string) {
        player.clientId = clientId
        return this.saveValidPlayer(player)
    }

    async updatePlayerScore(players: Player[], score: Record<string, number>) {
        for (const player of players) {
            player.score += score[player.id]
        }

        return this.playerRepo.save(players)
    }


    async updatePlayerQueue(player: Player, queue?: Queue) {
        if (!queue) {
            player.queue = null
        } else {
            player.queue = queue
        }
        return this.saveValidPlayer(player)
    }

    async updatePlayerState(player: Player, state: GameState) {
        player.gameState = state
        return this.saveValidPlayer(player)
    }

    getPlayers(): Promise<Player[]> {
        return this.playerRepo.find()
    }

}
