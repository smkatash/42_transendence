import { Controller, Get, Inject, Res, UseGuards, UnauthorizedException, Req, Post, Body, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { OauthGuard } from './guard/oauth.guard';
import { Response } from 'express';
import { AuthService } from './service/auth.service';
import { GetUser } from './utils/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { SessionGuard } from './guard/auth.guard';
import { Status } from 'src/user/utils/status.enum';
import { FRONT_END_2FA_CALLBACK_URL, FRONT_END_CALLBACK_URL } from 'src/Constants';
import { UserService } from 'src/user/service/user.service';
import { MailService } from './service/mail.service';
import { SessionUserDto } from 'src/user/utils/user.dto';
import { CodeDto } from './utils/entity.dto';
import * as session from 'express-session';

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
					await this.mailService.send(currentUser.email, `Your Auth Code is: ${token.value}`)
					await this.userService.updateUserStatus(currentUser.id, Status.MFAPending)
					res.status(302).redirect(FRONT_END_2FA_CALLBACK_URL)
					//res.status(302).redirect('mfa')
			}
			await this.userService.updateUserStatus(currentUser.id, Status.ONLINE)
			res.status(302).redirect(FRONT_END_CALLBACK_URL)
				//res.status(302).redirect('test')
		} catch (error) {
			throw error
		}
    }

    @Get('test')
    @UseGuards(SessionGuard)
    async handleTest(@GetUser() currentUser: SessionUserDto) {
        if (currentUser) {
            return { message: 'OK' }
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
			if (currentUser.mfaEnabled === true && currentUser.email) {
				const token = await this.authService.createAuthToken(currentUser.id)
				if (token && token.value) {
					await this.mailService.send(currentUser.email, `Your Auth Code is: ${token.value}`)
					return currentUser
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
				if (this.authService.isValidTokenData(currentUser.id, codeDto.code)) {
					await this.userService.verifyUserMfa(currentUser.id)
					await this.authService.removeToken(codeDto.code)
					res.status(302).redirect(FRONT_END_CALLBACK_URL)
				}
			} catch (error) {
				throw error
			}
			throw new UnauthorizedException('Invalid token')
		}


	@Post('verify-mfa')
	@UseGuards(SessionGuard)
	async handleMfaVerification(@GetUser() currentUser: SessionUserDto, @Body() codeDto: CodeDto, 
		@Res({ passthrough: true }) res: Response) {
        if (!currentUser) {
				throw new UnauthorizedException('Access denied');
		}

		try {
			if (this.authService.isValidTokenData(currentUser.id, codeDto.code)) {
				await this.userService.verifyUserMfa(currentUser.id)
				await this.authService.removeToken(codeDto.code)
				return HttpStatus.ACCEPTED
			}
		} catch (error) {
			throw error
		}
		throw new UnauthorizedException('Invalid token')
    }
	
	

    @Get('logout')
    @UseGuards(SessionGuard)
    async handleLogOut(@GetUser() currentUser: SessionUserDto,@Req() req, @Res() res: Response) {
		if (!currentUser) {
			throw new UnauthorizedException('Access denied');
		}

		try {
			await this.userService.logoutUser(currentUser.id)
			console.log(req.session)
			req.session.destroy()
			req.session = null
			console.log(req.session)
			res.clearCookie('pong.sid')
			return res.redirect(FRONT_END_CALLBACK_URL)
		} catch (error) {
			throw error
		} 
    }

}
