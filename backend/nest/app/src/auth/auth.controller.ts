import { Controller, Get, Inject, Res, UseGuards, UnauthorizedException, Req, Post, Body } from '@nestjs/common';
import { OauthGuard } from './guard/oauth.guard';
import { Response, Request } from 'express';
import { AuthService } from './services/auth.service';
import { GetUser } from './utils/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { SessionGuard } from './guard/auth.guard';
import { Status } from 'src/user/utils/status.dto';
import { FRONT_END_2FA_CALLBACK_URL, FRONT_END_CALLBACK_URL } from 'src/Constants';
import { UserService } from 'src/user/user.service';
import { MailService } from './services/mail.service';
import { MfaStatus } from './utils/mfa-status';

@Controller('42auth')
export class AuthController {
    constructor(
        @Inject('AUTH_SERVICE') private readonly authService: AuthService,
		@Inject(UserService) private userService: UserService) {}
    
    @Get('login')
    @UseGuards(OauthGuard)
    handleLogin() {
        return { msg: '42 Auth'}
    }
    
    @Get('redirect')
    @UseGuards(OauthGuard)
    async handleRedirect(@GetUser() user: User, @Res({ passthrough: true }) res: Response) {
        if (user && user.id) {
			if (user.mfaEnabled === true && user.email) {
				const token = await this.authService.createAuthToken(user.id)
				const mailer = new MailService()
				await mailer.send(user.email, `Your Auth Code is: ${token.value}`)
				await this.userService.updateUserStatus(user.id, Status.MFAPending)
				res.status(302).redirect(FRONT_END_2FA_CALLBACK_URL)
				//res.status(302).redirect('mfa')
			}
			await this.userService.updateUserStatus(user.id, Status.ONLINE)
			res.status(302).redirect(FRONT_END_CALLBACK_URL)
			//res.status(302).redirect('test')
        }
    }

	// @Get('testmfa')
	// async testEmail(@Res({ passthrough: true }) res: Response) {
	// 	try {
	// 		console.log('1----------------------------------------')
	// 		const id = '99637'
	// 		const token = await this.authService.createAuthToken(id)
	// 		console.log('2----------------------------------------')
	// 		console.log(token.value)
	// 		const mailer = new MailService()
	// 		console.log('3----------------------------------------')
	// 		await mailer.send('jad2maalouf@gmail.com', `Your Auth Code is: ${token.value}`)
	// 		console.log('4----------------------------------------')
	// 		await this.authService.removeToken(token.value)
	// 		console.log('5----------------------------------------')
	// 		res.status(302).redirect('test')
	// 	} catch (error) {
	// 		console.log(error)
	// 	}
	// }
    
    @Get('test')
    @UseGuards(SessionGuard)
    async handleTest(@GetUser() user: User) {
        if (user) {
            console.log('Success')
            return { message: 'OK' }
        } else {
            throw new UnauthorizedException()
        }
    }

	@Post('mfa')
	@UseGuards(SessionGuard)
	async handleMfaVerification(@GetUser() user: User, @Body('code') code: string, 
								@Res({ passthrough: true }) res: Response) {
        if (user && user.id) {
			if (this.authService.isValidTokenData(user.id, code)) {
				await this.userService.setMfaVerificationStatus(user.id, MfaStatus.VALIDATE)
				await this.userService.updateUserStatus(user.id, Status.ONLINE)
				await this.authService.removeToken(code)
				res.status(302).redirect(FRONT_END_CALLBACK_URL)
			}
		}
		throw new UnauthorizedException()
    }
	

    @Get('logout')
    @UseGuards(SessionGuard)
    async handleLogOut(@GetUser() user: User, @Res() res: Response) {
        await this.authService.updateUserStatus(user.id, Status.OFFLINE)
		await this.userService.setMfaVerificationStatus(user.id, MfaStatus.DENY)
        res.clearCookie('pong.sid')
        res.redirect('/')
    }

}
