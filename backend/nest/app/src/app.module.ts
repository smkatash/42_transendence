import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_TYPE, DB_USERNAME, REDIS_CLIENT, REDIS_HOST, REDIS_PASSWORD, REDIS_PORT, SESSION_SECRET } from './Constants';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { Match } from './game/entities/match.entity';
import { Player } from './game/entities/player.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { ChannelModule } from './chat/channel/channel.module';
import { BlockListModule } from './chat/block-list/block-list.module';
import { ChannelMessageModule } from './chat/channel-message/channel-message.module';
import { RankingModule } from './ranking/ranking.module';
import { ChatGateway } from './chat/chat/chat.gateway';
import { AuthToken } from './auth/entities/auth-token.entity';
import { ConfigModule } from '@nestjs/config';
import * as passport from 'passport';
import RediStore from 'connect-redis'
import { createClient } from 'redis';
import * as session from 'express-session';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'dev.env',
      isGlobal: true
    }),
    PassportModule.register({ session: true}),
    AuthModule,
    UserModule,
    TypeOrmModule.forRoot({
	  type: DB_TYPE,
      host: DB_HOST,
      port: Number(DB_PORT),
      username: DB_USERNAME,
      password: DB_PASSWORD,
      database: DB_NAME,
      entities: [User, Match, Player, AuthToken],
      synchronize: true
    }),
    GameModule,
    ScheduleModule.forRoot(),
    ChannelModule,
    ChannelMessageModule,
    BlockListModule,
    RankingModule,
  ],
  controllers: [AppController],
  providers: [AppService, ChatGateway],
})

export class AppModule {}
