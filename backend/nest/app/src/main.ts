import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';;
import { SESSION_SECRET } from './Constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.use(
      session({
      name: 'pong.sid',
      secret: SESSION_SECRET,
      saveUninitialized: false,
      resave: false,
      cookie: {
        httpOnly: false
      }
    })
  )
  app.use(passport.initialize())
  app.use(passport.session())
  await app.listen(3000)
}
bootstrap()


