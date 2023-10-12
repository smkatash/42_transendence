import { Controller, Get, Inject, Res, UseGuards, UnauthorizedException, Req, Post, Body, HttpStatus } from '@nestjs/common';
import { OauthGuard } from './guard/oauth.guard';
import { Response } from 'express';
import { AuthService } from './services/auth.service';
import { GetUser } from './utils/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { SessionGuard } from './guard/auth.guard';
import { Status } from 'src/user/utils/status.enum';
import { FRONT_END_2FA_CALLBACK_URL, FRONT_END_CALLBACK_URL } from 'src/Constants';
import { UserService } from 'src/user/service/user.service';
import { MailService } from './services/mail.service';
import { SessionUserDto } from 'src/user/utils/user.dto';
import { CodeDto } from './utils/entity.dto';

@Controller('42auth')
export class AuthController {
    constructor(
        @Inject('AUTH_SERVICE') private readonly authService: AuthService,
		@Inject(UserService) private userService: UserService,
		@Inject(MailService) private mailService: MailService) {}
    
    @Get('login')
    @UseGuards(OauthGuard)
    handleLogin() {
        return { msg: '42 Auth'}
    }
    
    @Get('redirect')
    @UseGuards(OauthGuard)
    async handleRedirect(@GetUser() user: SessionUserDto, @Res({ passthrough: true }) res: Response) {
        if (user && user.id) {
			if (user.mfaEnabled === true && user.email) {
				const token = await this.authService.createAuthToken(user.id)
				await this.mailService.send(user.email, `Your Auth Code is: ${token.value}`)
				await this.userService.updateUserStatus(user.id, Status.MFAPending)
				res.status(302).redirect(FRONT_END_2FA_CALLBACK_URL)
				//res.status(302).redirect('mfa')
			}
			await this.userService.updateUserStatus(user.id, Status.ONLINE)
			res.status(302).redirect(FRONT_END_CALLBACK_URL)
			//res.status(302).redirect('test')
        }
    }

    @Get('test')
    @UseGuards(SessionGuard)
    async handleTest(@GetUser() user: SessionUserDto) {
        if (user) {
            return { message: 'OK' }
        } else {
			throw new UnauthorizedException()
        }
    }
	
	@Get('send-code-mfa')
	@UseGuards(SessionGuard)
	async sendVerificationCode(@GetUser() user: SessionUserDto) {
		if (user && user.id) {
			if (user.mfaEnabled === true && user.email) {
				const token = await this.authService.createAuthToken(user.id)
				await this.mailService.send(user.email, `Your Auth Code is: ${token.value}`)
				return user
			}
		}
		throw new UnauthorizedException()
	}


	@Post('login-verify-mfa')
	@UseGuards(SessionGuard)
	async handleLoginMfaVerification(@GetUser() user: SessionUserDto, @Body() codeDto: CodeDto, 
								@Res({ passthrough: true }) res: Response) {
        if (user && user.id) {
			if (this.authService.isValidTokenData(user.id, codeDto.code)) {
				await this.userService.verifyUserMfa(user.id)
				await this.authService.removeToken(codeDto.code)
				res.status(302).redirect(FRONT_END_CALLBACK_URL)
			}
		}
		throw new UnauthorizedException()
    }
	@Post('verify-mfa')
	@UseGuards(SessionGuard)
	async handleMfaVerification(@GetUser() user: SessionUserDto, @Body() codeDto: CodeDto, 
								@Res({ passthrough: true }) res: Response) {
        if (user && user.id) {
			if (this.authService.isValidTokenData(user.id, codeDto.code)) {
				await this.userService.verifyUserMfa(user.id)
				await this.authService.removeToken(codeDto.code)
				return HttpStatus.ACCEPTED
			}
		}
		throw new UnauthorizedException()
    }
	
	

    @Get('logout')
    @UseGuards(SessionGuard)
    async handleLogOut(@GetUser() user: SessionUserDto, @Res() res: Response) {
		if (user && user.id) {
			await this.userService.logoutUser(user.id)
			res.clearCookie('pong.sid')
			res.redirect(FRONT_END_CALLBACK_URL)
		}
		throw new UnauthorizedException()
    }

}
