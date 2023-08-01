import {Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { UserData } from 'src/auth/utils/types';
import { Repository } from 'typeorm';


@Injectable()
export class AuthService {

    constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

    async validateUser(userData: UserData): Promise<User> {
        console.log('validate User')

        const currentUser = await this.findUser(userData.id)

        if (currentUser) {
            console.log('User found')
            return currentUser
        }
        
        console.log('Creating a new user')
        const newUser = this.userRepo.create(userData)
        return await this.userRepo.save(newUser)
    }

    async findUser(id: string): Promise<User> {
        const user = await this.userRepo.findOneBy({id})
        return user
    }
}
