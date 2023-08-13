import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { AuthUserDto } from 'src/auth/utils/auth.user.dto';
import { validate } from 'class-validator';

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

    async getUserById(id: string): Promise<User> {
      return this.userRepo.findOneBy({id})
    }
    

    async saveValidUser(user: User) {
      const validate_error = await validate(user);
      if (validate_error.length > 0) {
        throw new BadRequestException();
      }
      return this.userRepo.save(user);
    }

    async createUser(newUser: AuthUserDto): Promise<User> {
      console.log('Creating a new user')
      console.log(newUser)
      const user = this.userRepo.create(newUser)
      return this.userRepo.save(user)
    }

    async updateUserStatus(id: string, status: boolean) {
        const user = await this.getUserById(id)
        user.status = status;
        return this.saveValidUser(user)
    }

    async updateUserAvatar(id: string, image: string): Promise<User> {
      const user = await this.getUserById(id)
      user.avatar = image
      return this.saveValidUser(user)
    }



}
