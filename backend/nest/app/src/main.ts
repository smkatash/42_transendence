import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import {createClient} from "redis"
import RediStore from 'connect-redis'
import { FRONT_END_URL, REDIS_CLIENT, SESSION_SECRET } from './Constants';
import * as passport from 'passport'
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe({
	whitelist: true
  }));

  app.enableCors({
	origin: FRONT_END_URL,
	credentials: true
  })

  let redisClient = createClient({url: REDIS_CLIENT})
  await redisClient.connect().catch(console.error)
  app.use(
    session({
    store: new RediStore({client: redisClient}),
    name: 'pong.sid',
    secret: SESSION_SECRET,
    saveUninitialized: true,
    resave: false,
    cookie: {
		secure: false,
      	httpOnly: true,
      	maxAge: 3600000,
		expires: new Date(Date.now() + 3600000) 
    }
  })
  )
  app.use(passport.initialize())
  app.use(passport.session())
  await app.listen(3000)
}
bootstrap()


