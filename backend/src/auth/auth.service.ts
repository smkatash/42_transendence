import { Injectable } from '@nestjs/common';
import { OAuthDto } from './dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(private users: UsersService){}
    //user validation/creation
    async validateUser(dto: OAuthDto){
         console.log('AuthService')
         console.log(dto)
         const user = await this.users.getUser(dto)
         return user;
    }
    async findUser(email: string){
        const user = await this.users.findUserByEmail(email)
        return user
    }
    redirect(){

    }
    status(){

    }
    logout(){

    }
}
