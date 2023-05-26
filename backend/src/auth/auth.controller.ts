import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { OAuth42Guard } from './guards';
import { OAuthDto } from './dto';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService){}
    @Get('42/login')
    @UseGuards(OAuth42Guard)
    login(dto: OAuthDto){
        return {willkommen: 'Oo'}
    }
    @Get('42/redirect')
    // @Get('redirect')
    @UseGuards(OAuth42Guard)
    redirect(){
        return {redirect: 'OkOk'}
        // return this.authService.redirect()
    }
    //TODO aaaaaaaaaaaaaaaaaaaaa!
    @Get('status')
    user(@Req() request: Request){
        console.log(request);
        // if (request.user)   {
            // return {msg: 'authenticated'}
        // }   else    {
            // return {msg: "not authenticated"}
        // }
    }
    @Get('logout')
    logout(){
        // return this.authService.logout()
    }
}