import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_TYPE, DB_USERNAME, REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from './Constants';
import { UserModule } from './user/user.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { GameModule } from './game/game.module';
import { Match } from './game/entities/match.entity';
import { Player } from './game/entities/player.entity';
import { Queue } from './game/entities/queue.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { ChannelModule } from './chat/channel/channel.module';
import { BlockListModule } from './chat/block-list/block-list.module';
import { ChannelMessageModule } from './chat/channel-message/channel-message.module';
// import { ChannelUserModule } from './chat/channel_user/channel_user.module';
// import { ChannelMessageModule } from './chat/channel_message/channel_message.module';
// import { BlockListModule } from './chat/block_list/block_list.module';
// import { FriendListModule } from './chat/friend_list/friend_list.module';
import { RankingModule } from './ranking/ranking.module';
// import { ChannelModule } from './chat/channel/channel.module';
// import { ChatGatewayGateway } from './chat/chat-gateway/chat-gateway.gateway';
import { ChatGateway } from './chat/chat/chat.gateway';


@Module({
  imports: [
    PassportModule.register({ session: true}),
    AuthModule,
    UserModule,
    RedisModule.forRoot({
      config: {
        host: REDIS_HOST,
        port: REDIS_PORT,
        password: REDIS_PASSWORD
      }
    }),
    TypeOrmModule.forRoot({
      type: DB_TYPE,
      host: DB_HOST,
      port: DB_PORT,
      username: DB_USERNAME,
      password: DB_PASSWORD,
      database: DB_NAME,
      entities: [User, Match, Player, Queue],
      synchronize: true
    }),
    GameModule,
    ScheduleModule.forRoot(),
    ChannelModule,
    // ChannelUserModule,
    ChannelMessageModule,
    BlockListModule,
    // FriendListModule,
    RankingModule,
  ],
  controllers: [AppController],
  providers: [AppService, ChatGateway],
})

export class AppModule {}
