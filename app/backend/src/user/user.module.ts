import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { Player } from 'src/game/entities/player.entity';
import { Channel } from 'src/chat/entities/channel.entity';
import { ChatModule } from 'src/chat/chat.module';
import { UserGateway } from './user.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([User, Player]),
            forwardRef(() => AuthModule), PassportModule],
  providers: [UserService, UserGateway],
  controllers: [UserController],
  exports: [UserService]
})
export class UserModule {}
