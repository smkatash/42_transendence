import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Queue } from '../entities/queue.entity';
import { PlayerService } from "./player.service";
import { validate } from "class-validator";
import { Player } from '../entities/player.entity';

@Injectable()
export class QueueService {
    private readonly queueName = 'fifo'
    

    constructor(@InjectRepository(Queue) private queueRepo: Repository<Queue>,
                private readonly playerService: PlayerService) {}

    createQueue(): Promise<Queue> {
        const params: Queue = {
            id: this.queueName,
            count: 0,
            players: [],
        }

        const queue = this.queueRepo.create(params)
        return this.saveValidQueue(queue)
    }


    async getQueue(): Promise<Queue> {
        return this.queueRepo.findOne({
            where: {
                id: this.queueName,
            }, relations: ['players']
        })
    }

    async updatePlayersInQueue(player: Player, queue: Queue) {
        player = await this.playerService.updatePlayerQueue(player, queue)
        return await this.getQueue()
    }

    async removePlayerFromQueue(player: Player) {
        player = await this.playerService.updatePlayerQueue(player, null)
        return await this.getQueue()
    }

    async saveValidQueue(queue: Queue): Promise<Queue> {
        const validate_error = await validate(queue);
        if (validate_error.length > 0) {
          throw new BadRequestException();
        }
        return this.queueRepo.save(queue);
      }

}