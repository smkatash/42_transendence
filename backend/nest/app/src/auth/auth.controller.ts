import { Controller, Get, Inject, Res, UseGuards, UnauthorizedException, Req } from '@nestjs/common';
import { OauthGuard } from './guard/oauth.guard';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { GetUser } from './utils/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { SessionGuard } from './guard/auth.guard';
import { GetSession, SessionParams } from './utils/get-session';
import { RedisSessionService } from 'src/redis/redis-session.service';
import { Status } from 'src/user/utils/status.dto';
import { FRONT_END_CALLBACK_URL } from 'src/Constants';

@Controller('42auth')
export class AuthController {
    constructor(
        @Inject('AUTH_SERVICE') private readonly authService: AuthService,
        private readonly redisSessionService: RedisSessionService
      ) {}
    
    @Get('login')
    @UseGuards(OauthGuard)
    handleLogin() {
        return { msg: '42 Auth'}
    }
    
    @Get('redirect')
    @UseGuards(OauthGuard)
    async handleRedirect(@GetUser() user: User,  @GetSession() session: SessionParams , @Res({ passthrough: true }) res: Response) {
        if (user) {
            await this.authService.updateUserStatus(user.id, Status.ONLINE)
            res.status(302).redirect(FRONT_END_CALLBACK_URL)
        }
    }
    
    @Get('test')
    @UseGuards(SessionGuard)
    async handle(@GetUser() user: User, @GetSession() session: SessionParams) {
        if (user) {
            console.log('Success')
            return { message: 'OK', sessionData: session }
        } else {
            throw new UnauthorizedException()
        }
    }

    @Get('logout')
    @UseGuards(SessionGuard)
    async handleLogOut(@GetUser() user: User, @GetSession() session: SessionParams, @Res() res: Response) {
        await this.authService.updateUserStatus(user.id, Status.OFFLINE)
        this.redisSessionService.deleteSession(session.id)
        res.clearCookie('pong.sid')
        res.redirect('/')
    }

}
