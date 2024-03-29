import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import RediStore from "connect-redis";
import * as session from "express-session";
import * as passport from "passport";
import { createClient } from "redis";
import { AppModule } from "./app.module";
import { FRONT_END_URL, REDIS_CLIENT, SESSION_SECRET } from "./utils/Constants";
import { SessionAdapter } from "./utils/session-adapter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api");

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  app.enableCors({
    origin: FRONT_END_URL,
    credentials: true,
  });

  const redisClient = createClient({ url: REDIS_CLIENT });
  await redisClient.connect().catch(console.error);
  const sessionMiddleware = session({
    store: new RediStore({ client: redisClient }),
    name: "pong.sid",
    secret: SESSION_SECRET,
    saveUninitialized: true,
    resave: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 2 * 60 * 60 * 1000,
      sameSite: "lax",
      expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
    },
  });
  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());
  app.useWebSocketAdapter(new SessionAdapter(sessionMiddleware, app));

  await app.listen(3000);
}
bootstrap();
