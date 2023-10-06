import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { OauthStrategy } from './strategy/oauth.strategy';
import { AuthService } from './services/auth.service';
import { SessionSerializer } from './utils/serializer';
import { UserModule } from 'src/user/user.module';
import { RedisSessionModule } from 'src/redis/redis-session.module';
import { AuthToken } from './entities/auth-token.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([AuthToken]), forwardRef(() => UserModule), RedisSessionModule],
  controllers: [AuthController],
  providers: [
    OauthStrategy,
    SessionSerializer, {
    provide: 'AUTH_SERVICE',
    useClass: AuthService,
  }]
})
export class AuthModule {}
