import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { MatchService } from './service/match.service';
import { Match } from './entities/match.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './entities/player.entity';
import { PlayerService } from './service/player.service';
import { PlayerQueueService } from './service/queue.service';
import { GameService } from './service/game.service';
import { PassportModule } from '@nestjs/passport';
import { AuthToken } from 'src/auth/entities/auth-token.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Match, Player, AuthToken]), UserModule, AuthModule, PassportModule],
    providers: [GameGateway, MatchService, PlayerService, PlayerQueueService, GameService],
    exports: [MatchService, PlayerService]
})

export class GameModule {}