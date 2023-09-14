import { Injectable } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { AuthUserDto } from 'src/auth/utils/auth.user.dto';

import { UserService } from '../user/user.service';
import { Status } from 'src/user/utils/status.dto';



@Injectable()
export class AuthService {

    constructor(private userService: UserService) {}

    async validateUser(authUserDto: AuthUserDto): Promise<User> {
        console.log('validate User')
        const currentUser = await this.userService.getUserById(authUserDto.id)

        if (currentUser) {
            console.log('User found')
            return currentUser
        }

        return await this.userService.createUser(authUserDto)
    }

    async findUser(id: string): Promise<User> {
        return await this.userService.getUserById(id)
    }

    async updateUserStatus(id: string, status: Status) {
        return await this.userService.updateUserStatus(id, status)
    }
    
}
