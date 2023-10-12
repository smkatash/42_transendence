import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { RedisSessionModule } from 'src/redis/redis-session.module';
import { Player } from 'src/game/entities/player.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Player]),
            forwardRef(() => AuthModule), PassportModule, RedisSessionModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService]
})
export class UserModule {}
