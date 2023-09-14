import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';

@Module({
    providers: [GameGateway]
})

export class GameModule {}
