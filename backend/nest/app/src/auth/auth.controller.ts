import { Controller, Get, Inject, Res, UseGuards, UnauthorizedException, Req, Post, Body, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { OauthGuard } from './guard/oauth.guard';
import { Response } from 'express';
import { AuthService } from './service/auth.service';
import { GetUser } from './utils/get-user.decorator';
import { SessionGuard } from './guard/auth.guard';
import { Status } from 'src/user/utils/status.enum';
import { FRONT_END_2FA_CALLBACK_URL, FRONT_END_CALLBACK_URL, FRONT_END_URL } from 'src/Constants';
import { UserService } from 'src/user/service/user.service';
import { MailService } from './service/mail.service';
import { SessionUserDto } from 'src/user/utils/user.dto';
import { CodeDto } from './utils/entity.dto';
import { MfaStatus } from './utils/mfa-status';

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
    async handleRedirect(@GetUser() currentUser: SessionUserDto, @Res({ passthrough: true }) res: Response) {
		if (!currentUser) {
			throw new UnauthorizedException('Access denied');
		}
		
		try {
			if (currentUser.mfaEnabled === true && currentUser.email) {
				const token = await this.authService.createAuthToken(currentUser.id)
				await this.mailService.send(currentUser.email, token.value)
				await this.userService.setMfaVerificationStatus(currentUser.id, MfaStatus.MFAPending)
				return res.status(302).redirect(FRONT_END_2FA_CALLBACK_URL)
			}
			await this.userService.updateUserStatus(currentUser.id, Status.ONLINE)
			return res.status(302).redirect(FRONT_END_CALLBACK_URL)
		} catch (error) {
			throw error
		}
    }

    @Get('test')
    @UseGuards(SessionGuard)
    async handleTest(@GetUser() currentUser: SessionUserDto, @Res({ passthrough: true }) res: Response) {
        if (currentUser) {
            res.status(200);
        } else {
			throw new UnauthorizedException('Access denied');
        }
    }
	
	@Get('send-code-mfa')
	@UseGuards(SessionGuard)
	async sendVerificationCode(@GetUser() currentUser: SessionUserDto) {
		if (!currentUser) {
			throw new UnauthorizedException('Access denied');
		}

		try {
			if (currentUser.email) {
				const token = await this.authService.createAuthToken(currentUser.id)
				if (token && token.value) {
					await this.mailService.send(currentUser.email, token.value)
					console.log(token.value)
					await this.userService.enableMfaVerification(currentUser.id)
				} else {
					throw new InternalServerErrorException('Failed to send token')
				}
			}
		} catch(error) {
			throw error
		}
	}


	@Post('login-verify-mfa')
	@UseGuards(SessionGuard)
	async handleLoginMfaVerification(@GetUser() currentUser: SessionUserDto, @Body() codeDto: CodeDto, 
		@Res({ passthrough: true }) res: Response) {

			if (!currentUser) {
				throw new UnauthorizedException('Access denied');
			}

			try {
				if (await this.authService.isValidTokenData(currentUser.id, codeDto.code)) {
					await this.userService.verifyUserMfa(currentUser.id)
					await this.authService.removeToken(codeDto.code)
					res.status(202)
				} else {
					throw new UnauthorizedException('Invalid token')
				}
			} catch (error) {
				throw error
			}
		}


	@Post('verify-mfa')
	@UseGuards(SessionGuard)
	async handleMfaVerification(@GetUser() currentUser: SessionUserDto, @Body() codeDto: CodeDto, 
		@Res({ passthrough: true }) res: Response) {
        if (!currentUser) {
				throw new UnauthorizedException('Access denied');
		}

		try {
			if (await this.authService.isValidTokenData(currentUser.id, codeDto.code)) {
				await this.userService.verifyUserMfa(currentUser.id)
				await this.authService.removeToken(codeDto.code)
				res.status(202)
			} else {
				await this.userService.disableMfaVerification(currentUser.id)
				throw new UnauthorizedException('Invalid token')
			}
		} catch (error) {
			throw error
		}
    }

    @Get('logout')
    @UseGuards(SessionGuard)
    async handleLogOut(@GetUser() currentUser: SessionUserDto,@Req() req, @Res() res: Response) {
		if (!currentUser) {
			throw new UnauthorizedException('Access denied');
		}

		try {
			await this.userService.logoutUser(currentUser.id)
			req.session.destroy()
			res.clearCookie('pong.sid')
			res.status(302).redirect(FRONT_END_CALLBACK_URL)
		} catch (error) {
			throw error
		} 
	}

}
