import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { Strategy42 } from './auth.strategy';
import { SessionSerializer } from './utils';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersService,
    Strategy42,
    SessionSerializer 
  ]
})
export class AuthModule {}