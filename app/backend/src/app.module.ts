import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";
import { ScheduleModule } from "@nestjs/schedule";
import { ServeStaticModule } from "@nestjs/serve-static";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { AuthToken } from "./auth/entities/auth-token.entity";
import { ChatModule } from "./chat/chat.module";
import { Channel } from "./chat/entities/channel.entity";
import { ChatUser } from "./chat/entities/chatUser.entity";
import { JoinedChannel } from "./chat/entities/joinedChannel.entity";
import { Message } from "./chat/entities/message.entity";
import { Mute } from "./chat/entities/mute.entity";
import { Match } from "./game/entities/match.entity";
import { Player } from "./game/entities/player.entity";
import { GameModule } from "./game/game.module";
import { RankingModule } from "./ranking/ranking.module";
import { User } from "./user/entities/user.entity";
import { UserModule } from "./user/user.module";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_TYPE, DB_USERNAME } from "./utils/Constants";
import { GlobalExceptionFilter } from "./utils/exception-handler";
import { APP_FILTER } from "@nestjs/core";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: "dev.env",
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "public"),
    }),
    PassportModule.register({ session: true }),
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
      synchronize: true,
    }),
    GameModule,
    ScheduleModule.forRoot(),
    RankingModule,
    ChatModule
  ],
  controllers: [AppController],
  providers: [AppService,
  {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    }],
})

export class AppModule {}
