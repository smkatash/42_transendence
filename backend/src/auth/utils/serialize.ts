import { PassportSerializer } from "@nestjs/passport";
import { AuthService } from "../auth.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class SessionSerializer extends PassportSerializer   {
    constructor(private readonly authService: AuthService)  {
        super();
    }
    serializeUser(user: any, done: Function) {
        console.log('Serialize user\n', user)
        done(null, user)
    }
    async deserializeUser(payload: any, done: Function) {
        console.log('Deserialize User-> payload\n', payload)
        const user = await this.authService.findUser(payload.email);
        console.log('found user -> ', user)
        return user ? done(null, user) : done(null, null);
    }
}