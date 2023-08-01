import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { OauthGuard } from './guard/oauth.guard';
import { Request } from 'express';

@Controller('42auth')
export class AuthController {
    
    @Get('login')
    @UseGuards(OauthGuard)
    handleLogin() {
        return { msg: '42 Auth'}
    }
    
    @Get('redirect')
    @UseGuards(OauthGuard)
    handleRedirect() {
        return { msg: 'OK'}
    }

    @Get('test')
    handle(@Req() request: Request) {
        console.log(request.user)
        if (request.user) {
            return { msg: 'Authenticated'}
        } else {
            return { msg: 'Not authenticated'}
        }
    }
}
