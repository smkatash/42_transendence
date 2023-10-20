import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { OauthStrategy } from './strategy/oauth.strategy';
import { AuthService } from './service/auth.service';
import { SessionSerializer } from './utils/serializer';
import { UserModule } from 'src/user/user.module';
import { AuthToken } from './entities/auth-token.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailService } from './service/mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuthToken]), forwardRef(() => UserModule)],
  controllers: [AuthController],
  providers: [
    OauthStrategy,
    SessionSerializer,
	MailService, {
    provide: 'AUTH_SERVICE',
    useClass: AuthService,
  }]
})
export class AuthModule {}
