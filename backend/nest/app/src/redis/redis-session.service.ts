import { Injectable } from '@nestjs/common';
import { RedisService } from '@liaoliaots/nestjs-redis';

@Injectable()
export class RedisSessionService {
  constructor(private readonly redisService: RedisService) {}

  async storeSession(sessionId: string, sessionData: any): Promise<void> {
    await this.redisService.getClient().set(sessionId, JSON.stringify(sessionData));
  }

  async getSession(sessionId: string): Promise<any | null> {
    const sessionString = await this.redisService.getClient().get(sessionId);
    return sessionString ? JSON.parse(sessionString) : null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.redisService.getClient().del(sessionId);
  }
}
