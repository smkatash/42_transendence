import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-42"
import { CALLBACK_URL, CLIENT_ID, CLIENT_SECRET } from "src/Constants";
import { AuthService } from "../auth.service";
import { AuthUserDto } from "../utils/auth.user.dto";
import { Profile } from "../utils/profile";
import { User } from "src/user/entities/user.entity";
import { Status } from "src/user/utils/status.dto";

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

    async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<User> {
        console.log('Validation')
        console.log(accessToken)
        console.log(refreshToken)
        console.log('-------')
        const authUserDto: AuthUserDto = {
            id: profile.id,
            username: profile.login,
            email: profile.email,
            avatar: profile.image_url,
            status: Status.ONLINE
        }
        console.log(authUserDto)
        const user = await this.authService.validateUser(authUserDto)
        if (!user) {
            throw new UnauthorizedException()
        }
        console.log('Returning: ' + JSON.stringify(user))
        return user
    }
}