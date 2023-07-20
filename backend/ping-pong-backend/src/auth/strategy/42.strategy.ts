import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-42"
import { VerifyCallback } from "passport-oauth2";
import { CALLBACK_URL, CLIENT_ID, CLIENT_SECRET } from "src/Constants";


export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
    constructor() {
        super({
            clientID: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            callbackURL: CALLBACK_URL,
            profileFields: []
        })
    }

    async validate(_accessToken: string, _refreshToken: string, profile: any, done: VerifyCallback) {
        console.log(profile)
        const user = profile

        done(null, user)
    }
}