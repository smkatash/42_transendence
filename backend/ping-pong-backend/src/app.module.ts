import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { ServiceModule } from './service/service.module';

@Module({
  imports: [AuthModule, ServiceModule],
  controllers: [AppController, AuthController],
  providers: [AppService],
})
export class AppModule {}
