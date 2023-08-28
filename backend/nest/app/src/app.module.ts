import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_TYPE, DB_USERNAME, SESSION_SECRET } from './Constants';
import { UserModule } from './user/user.module';
import { RedisModule } from './redis/redis.module';
import * as session from 'express-session';
import RedisStore from "connect-redis"
import { RedisService } from './redis/redis.service';
import { GameModule } from './game/game.module';

@Module({
  imports: [
    PassportModule.register({ session: true}),
    AuthModule,
    RedisModule,
    UserModule,
    TypeOrmModule.forRoot({
      type: DB_TYPE,
      host: DB_HOST,
      port: DB_PORT,
      username: DB_USERNAME,
      password: DB_PASSWORD,
      database: DB_NAME,
      entities: [User],
      synchronize: true
    }),
    GameModule,
  ],
  controllers: [AppController],
  providers: [AppService, RedisService],
})

export class AppModule {}

// export class AppModule implements NestModule {
//   constructor(private readonly redisService: RedisService) {}

//   configure(consumer: MiddlewareConsumer) {

//     const sessionMiddleware = session({
//       store: new RedisStore({ client: this.redisService.getClient() }),
//       secret: SESSION_SECRET,
//       resave: false,
//       saveUninitialized: false,
//       cookie: {
//         httpOnly: false,
//         maxAge: 60 * 60 * 1000
//       }
//     })

//     consumer.apply(sessionMiddleware).forRoutes('/42auth/test')
//   }
// }

