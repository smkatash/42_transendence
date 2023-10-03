import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { RedisSessionService } from 'src/redis/redis-session.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly redisSessionService: RedisSessionService) {}
  
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    if (!request.isAuthenticated()) {
      return false
    }
    console.log("Session Guard")
    console.log(request.sessionID)
    if (!request.sessionID || !request.session) {
      return false
    }
    console.log("Session verified")

    return true
  }
}