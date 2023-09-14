import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    providers: [GameGateway],
    imports: [UserModule, AuthModule]
})

export class GameModule {}
