import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FortyTwoOauthGuard } from './guard/42-oauth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Get('42')
    @UseGuards(FortyTwoOauthGuard)
    async auth() {}
}
