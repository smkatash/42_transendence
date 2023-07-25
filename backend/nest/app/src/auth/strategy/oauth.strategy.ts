import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-42"
import { CALLBACK_URL, CLIENT_ID, CLIENT_SECRET } from "src/Constants";
import { AuthService } from "../auth.service";
import { UserData } from "../utils/types";
import { Profile } from "../utils/profile";

@Injectable()
export class OauthStrategy extends PassportStrategy(Strategy, '42') {
    constructor(@Inject('AUTH_SERVICE') private authService: AuthService) {
        super({
            clientID: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            callbackURL: CALLBACK_URL,
            profileFields: {
				'id': function (obj) { return String(obj.id); },
                'login': 'login',
                'email': function (obj) { return String(obj.email); },
				'image_url': function (obj) { return obj.image.link},
			}
        })
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile) {
        console.log('Validation')
        console.log(accessToken)
        console.log(refreshToken)
        console.log('-------')
        const userData: UserData = {
            id: profile.id,
            login: profile.login,
            email: profile.email,
            avatar: profile.image_url
        }

        console.log(userData)
        const user = await this.authService.validateUser(userData)
        console.log(user)
        return user || null
    }
}