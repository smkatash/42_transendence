import { Controller, Get, UseGuards } from '@nestjs/common';
import { OauthGuard } from './guard/oauth.guard';

@Controller('42auth')
export class AuthController {
    
    @Get('/login')
    @UseGuards(OauthGuard)
    handleLogin() {
        return { msg: '42 Auth'}
    }
    
    @Get('/redirect')
    @UseGuards(OauthGuard)
    handleRedirect() {
        return { msg: 'OK'}
    }
}
