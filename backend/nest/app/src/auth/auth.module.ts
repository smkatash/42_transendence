import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { OauthStrategy } from './strategy/oauth.strategy';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { OauthGuard } from './guard/oauth.guard';
import { SessionSerializer } from './utils/serializer';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [
    OauthStrategy,
    SessionSerializer, {
    provide: 'AUTH_SERVICE',
    useClass: AuthService,
  }]
})
export class AuthModule {}
