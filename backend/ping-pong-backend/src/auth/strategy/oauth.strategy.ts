import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-42"
import { CALLBACK_URL, CLIENT_ID, CLIENT_SECRET } from "src/Constants";

@Injectable()
export class OauthStrategy extends PassportStrategy(Strategy, '42') {
    constructor() {
        super({
            clientID: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            callbackURL: CALLBACK_URL,
            profileFields: {
				'name.givenName': 'login',
				'id': function (obj) { return String(obj.id); },
				'image_url': function (obj) { return obj.image.link},
			}
        })
    }

    async validate(accessToken: string, refreshToken: string, profile: any) {
        console.log('Hello')
        console.log(accessToken)
        console.log(refreshToken)
        console.log(profile)
    }
}