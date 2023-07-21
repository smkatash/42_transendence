import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { OauthStrategy } from './strategy/oauth.strategy';
import { OauthGuard } from './guard/oauth.guard';

@Module({
  controllers: [AuthController],
  providers: [OauthStrategy, OauthGuard]
})
export class AuthModule {}
