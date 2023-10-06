import { Injectable } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { AuthUserDto } from 'src/auth/utils/auth.user.dto';
import { v4 } from 'uuid';
import { UserService } from '../../user/user.service';
import { Status } from 'src/user/utils/status.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthToken } from '../entities/auth-token.entity';
import { Repository } from 'typeorm';



@Injectable()
export class AuthService {

    constructor(private userService: UserService,
		@InjectRepository(AuthToken) private tokenRepo: Repository<AuthToken>) {}

    async validateUser(authUserDto: AuthUserDto): Promise<User> {
        console.log('validate User')
        const currentUser = await this.userService.getUserById(authUserDto.id)

        if (currentUser) {
            console.log('User found')
            return currentUser
        }
		authUserDto.avatar = await this.userService.getIntraProfile(authUserDto.avatar)
        return await this.userService.createUser(authUserDto)
    }

    async findUser(id: string): Promise<User> {
        return await this.userService.getUserById(id)
    }

    async updateUserStatus(id: string, status: Status) {
        return await this.userService.updateUserStatus(id, status)
    }

	async createAuthToken(userId: string) {
		const newToken = this.generateToken(userId)
		
		const token = this.tokenRepo.create(newToken)
		return this.tokenRepo.save(token)
	}

	async isValidTokenData(userId: string, value: string) {
		const expiresIn = 1000 * 60 * 60 * 15;
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
		return this.tokenRepo.delete(value)
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
		return Buffer.from(randomString, 'hex').toString('base64')
	}
    
}
