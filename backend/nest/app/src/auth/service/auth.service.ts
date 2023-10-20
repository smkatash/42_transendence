import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { AuthUserDto } from 'src/auth/utils/auth.user.dto';
import { v4 } from 'uuid';
import { UserService } from '../../user/service/user.service';
import { Status } from 'src/user/utils/status.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthToken } from '../entities/auth-token.entity';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';



@Injectable()
export class AuthService {

    constructor(private userService: UserService,
		@InjectRepository(AuthToken) private tokenRepo: Repository<AuthToken>) {}

    async validateUser(authUserDto: AuthUserDto): Promise<User> {
		let currentUser: User

		try {
			currentUser = await this.userService.getUserById(authUserDto.id)
			// TODO enable later
			// if (currentUser.status === Status.ONLINE) {
			// 	throw new BadRequestException("User is logged in.")
			// }
		} catch (error) {
			if (error instanceof NotFoundException) {
				authUserDto.avatar = await this.userService.getIntraProfile(authUserDto.avatar)
				return this.userService.createUser(authUserDto)
			} else {
				throw error
			}
 		}
		return currentUser
    }

    async findUser(id: string): Promise<User> {
        return this.userService.getUserById(id)
    }

    async updateUserStatus(id: string, status: Status) {
        return this.userService.updateUserStatus(id, status)
    }

	async createAuthToken(userId: string) {
		const newToken = this.generateToken(userId)
		const token = this.tokenRepo.create(newToken)
		return this.tokenRepo.save(token)
	}

	async isValidTokenData(userId: string, value: string) {
		const expiresIn = 1000 * 60 * 60 * 15
		const token: AuthToken = await this.tokenRepo.findOneBy({value})
		
		if (token) {
			if (token.userId == userId  && 
				(Date.now() - token.expires) < expiresIn) {
				return true
			}
		} 
		return false
	}

	async removeToken(value: string) {
		return await this.tokenRepo.delete(value)
	}

	generateToken(userId: string) {
		const token: AuthToken = {
			value: this.getRandomCode(),
			userId: userId,
			expires: Date.now()
		}
		return token
	}

	private getRandomCode(): string {
		const randomString = v4().replace(/-/g, "")
		const hash = createHash('sha256').update(randomString).digest('hex')
		const baseHash = Buffer.from(hash, 'hex').toString('base64')
		return baseHash.slice(0, 8)
	}
    
}
