import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService, @InjectRepository(User) private userRepo: Repository<User>) {}


    generateJwt(payload) {
        return this.jwtService.sign(payload)
    }

    async signIn(user) {
        if (!user) {
            throw new BadRequestException('Unauthenticated')
        }

        // TODO search in the DB
        const userExists = await this.findUserByEmail(user.email)

        if (!userExists) {
        return this.registerUser(user)
        }

        return this.generateJwt({
            sub: userExists.id,
            email: userExists.email,
        })
    }

    async findUserByEmail(email: string) {
        const user = await this.userRepo.findOneBy(email)
    
        if (!user) {
          return null;
        }
    
        return user;
    }


}
