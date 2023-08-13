import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { OauthStrategy } from './strategy/oauth.strategy';
import { AuthService } from './auth.service';
import { SessionSerializer } from './utils/serializer';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [forwardRef(() => UserModule)],
  controllers: [AuthController],
  providers: [
    OauthStrategy,
    SessionSerializer, {
    provide: 'AUTH_SERVICE',
    useClass: AuthService,
  }],
})
export class AuthModule {}
