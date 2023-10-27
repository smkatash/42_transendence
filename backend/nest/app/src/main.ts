import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import {createClient} from "redis"
import RediStore from 'connect-redis'
import { FRONT_END_URL, REDIS_CLIENT, SESSION_SECRET } from './Constants';
import * as passport from 'passport';
import { ValidationPipe } from '@nestjs/common';
import { SessionAdapter } from './session-adapter';

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	app.useGlobalPipes(new ValidationPipe({
		whitelist: true
  	}));

  	app.enableCors({
		origin: FRONT_END_URL,
		credentials: true
	})

	app.useWebSocketAdapter(new SessionAdapter(app));
	await app.listen(3000)
}

bootstrap()


