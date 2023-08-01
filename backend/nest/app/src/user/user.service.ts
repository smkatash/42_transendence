import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

    async getUserById(id: string): Promise<User> {
        console.log('Getting user for id: ' + id)
        const user = await this.userRepo.findOneBy({id})
        return user
    }
}
