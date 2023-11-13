import { Module} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_TYPE, DB_USERNAME } from './Constants';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { Match } from './game/entities/match.entity';
import { Player } from './game/entities/player.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { RankingModule } from './ranking/ranking.module';
import { ChatModule } from './chat/chat.module';
import { AuthToken } from './auth/entities/auth-token.entity';
import { Channel } from './chat/entities/channel.entity';
import { ChatUser } from './chat/entities/chatUser.entity';
import { Message } from './chat/entities/message.entity';
import { JoinedChannel } from './chat/entities/joinedChannel.entity';
import { ConfigModule } from '@nestjs/config';
import { Mute } from './chat/entities/mute.entity';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'dev.env',
      isGlobal: true
    }),
	ServeStaticModule.forRoot({
		rootPath: join(__dirname, '..', 'public'),
	}),
    PassportModule.register({ session: true}),
    AuthModule,
    UserModule,
    TypeOrmModule.forRoot({
	  type: DB_TYPE,
      host: DB_HOST,
      port: DB_PORT,
      username: DB_USERNAME,
      password: DB_PASSWORD,
      database: DB_NAME,
      entities: [User, Match, Player, AuthToken, Channel, ChatUser, Message, JoinedChannel, Mute],
      synchronize: true
    }),
    GameModule,
    ScheduleModule.forRoot(),
    RankingModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
