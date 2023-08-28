import { Controller, Get, Inject, Res, UseGuards, UnauthorizedException, Req } from '@nestjs/common';
import { OauthGuard } from './guard/oauth.guard';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { GetUser } from './utils/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { AuthGuard } from './guard/auth.guard';
import { GetSession, SessionParams } from './utils/get-session';
import { RedisService } from 'src/redis/redis.service';

@Controller('42auth')
export class AuthController {
    constructor(
        @Inject('AUTH_SERVICE') private readonly authService: AuthService,
        private readonly redisService: RedisService
      ) {}
    
    @Get('login')
    @UseGuards(OauthGuard)
    handleLogin() {
        return { msg: '42 Auth'}
    }
    
    @Get('redirect')
    @UseGuards(OauthGuard)
    async handleRedirect(@GetUser() user: User, @Res({ passthrough: true }) res: Response) {
        if (user) {
            await this.authService.updateUserStatus(user.id, true)
            res.status(302).redirect('/42auth/test');
        }
    }
    
    @Get('test')
    @UseGuards(AuthGuard)
    async handle(@GetUser() user: User, @GetSession() session: SessionParams) {
        if (user) {
            console.log('Success')
            //await this.redisService.storeSession(session.id, JSON.stringify(session.session))
            //res.cookie('pong.sid', session.id)
            //await this.redisService.getSession(session.id)
            return { message: "OK"}
        } else {
            throw new UnauthorizedException()
        }
    }

    @Get('logout')
    handleLogOut(@GetUser() user: User, @Res() res: Response) {
        this.authService.updateUserStatus(user.id, false)
        res.clearCookie('pong.sid')
        res.redirect('/')
    }

}
