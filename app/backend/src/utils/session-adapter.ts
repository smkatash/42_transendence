import { INestApplicationContext } from "@nestjs/common";
import { RequestHandler } from "express";
import * as passport from "passport";
import { Server, ServerOptions } from "socket.io";
import { IoAdapter } from "@nestjs/platform-socket.io";

export class SessionAdapter extends IoAdapter {
  private session: RequestHandler;

  constructor(session: RequestHandler, app: INestApplicationContext) {
    super(app);
    this.session = session;
  }

  create(port: number, options?: ServerOptions): Server {
    const server: Server = super.create(port, options);

    const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

    server.use((socket, next) => {
      next();
    });
    server.use(wrap(this.session));
    server.use(wrap(passport.initialize()));
    server.use(wrap(passport.session()));
    return server;
  }
}
