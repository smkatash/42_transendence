import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { OauthStrategy } from './strategy/oauth.strategy';
import { AuthService } from './auth.service';
import { SessionSerializer } from './utils/serializer';
import { UserModule } from 'src/user/user.module';
import { RedisModule } from 'src/redis/redis.module';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [forwardRef(() => UserModule), RedisModule],
  controllers: [AuthController],
  providers: [
    OauthStrategy,
    SessionSerializer, {
    provide: 'AUTH_SERVICE',
    useClass: AuthService,
  }],
})
export class AuthModule {}
