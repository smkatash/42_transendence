import { INestApplication, INestApplicationContext } from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { RequestHandler } from "express";
import * as passport from "passport";
import { createClient } from "redis";
import { Server, ServerOptions } from "socket.io";
import { REDIS_CLIENT } from "./Constants";
import { createAdapter } from "@socket.io/redis-adapter";


export class SessionAdapter extends IoAdapter {
	protected redisAdapter;

  constructor(app: INestApplication) {
    super(app);

    const pubClient = createClient({url: REDIS_CLIENT});
    const subClient = pubClient.duplicate();

    pubClient.connect(); 
    subClient.connect(); 

    this.redisAdapter = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, options) as Server;

    server.adapter(this.redisAdapter);

    return server;
  }
}