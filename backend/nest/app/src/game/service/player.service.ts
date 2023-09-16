import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate } from 'class-validator';
import { Player } from '../entities/player.entity';
import { User } from 'src/user/entities/user.entity';
import { Socket } from 'socket.io';
import { Queue } from '../entities/queue.entity';

@Injectable()
export class PlayerService {
    constructor(@InjectRepository(Player) private playerRepo: Repository<Player>) {}

    createPlayer(user: User, clientId: string): Promise<Player> {
        const newPlayer: Player = {
            id: user.id,
            user: user,
            clientId: clientId,
            matches: [],
            queue: null
        }
        
        const player = this.playerRepo.create(newPlayer)
        return this.playerRepo.save(player)
    }

    async getPlayerById(id: string): Promise<Player> {
        return this.playerRepo.findOneBy({id})
    }

    async saveValidPlayer(player: Player) {
        const validate_error = await validate(player);
        if (validate_error.length > 0) {
          throw new BadRequestException();
        }
        return this.playerRepo.save(player);
      }

    async updatePlayerClient(id: string, clientId: string) {
        const player = await this.getPlayerById(id)
        player.clientId = clientId
        return this.saveValidPlayer(player)
    }


    async updatePlayerQueue(player: Player, queue: Queue | null) {
        player.queue = queue
        return this.saveValidPlayer(player)
    }

    async getPlayersByQueue(queue: Queue): Promise<Player[]>{
        const players = await this.playerRepo.find({
            where: {
                queue: queue
            }
        })
        return players
    }
}
