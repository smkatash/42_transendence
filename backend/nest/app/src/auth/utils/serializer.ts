import { PassportSerializer } from "@nestjs/passport";
import { AuthService } from '../auth.service';
import { Inject, Injectable } from "@nestjs/common";
import { User } from "src/user/entities/user.entity";

@Injectable()
export class SessionSerializer extends PassportSerializer {
    constructor(@Inject('AUTH_SERVICE') private authService: AuthService) {
        super()
    }

    serializeUser(user: User, done: Function) {
        console.log('Serialize')
        done(null, user)
    }

    async deserializeUser(payload: User, done: Function) {
        const user = await this.authService.findUser(payload.id)
        console.log('Deserialize')
        console.log(user)
        return user ? done(null, user) : done(null, null)
    }

}