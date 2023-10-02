import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import {createClient} from "redis"
import RediStore from 'connect-redis'
import { FRONT_END_URL, REDIS_CLIENT, SESSION_SECRET } from './Constants';
import * as passport from 'passport'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: FRONT_END_URL,
    credentials: true,
  })

  let redisClient = createClient({url: REDIS_CLIENT})
  await redisClient.connect().catch(console.error)
  app.use(
    session({
    store: new RediStore({client: redisClient}),
    name: 'pong.sid',
    secret: SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
      httpOnly: true,
      maxAge: 900000
    }
  })
  )
  app.use(passport.initialize())
  app.use(passport.session())
  await app.listen(3000)
}
bootstrap()


