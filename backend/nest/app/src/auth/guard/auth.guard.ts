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

    const session = await this.redisSessionService.getSession(request.sessionID)
    if (!session) {
      return false
    }

    return true
  }
}