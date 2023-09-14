import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { MatchService } from './service/match.service';
import { Match } from './entities/match.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([Match]), UserModule, AuthModule],
    providers: [GameGateway, MatchService],
})

export class GameModule {}
