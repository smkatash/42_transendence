import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from 'passport-42'
import { AuthService } from "./auth.service";
import { ConfigService } from "@nestjs/config";
import { OAuthDto } from "./dto";

@Injectable()
export class Strategy42 extends PassportStrategy(Strategy){
    constructor(private readonly authService: AuthService, private readonly config: ConfigService)   {
        super({
            clientID: config.get('FORTYTWO_APP_ID'),
            clientSecret: config.get('FORTYTWO_APP_SECRET'),
            callbackURL: config.get('CB_URL'),
            scope: ['public']
        });
    }
    async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<any>{
        console.log({
            profile,
            accessToken,
            refreshToken,
        });
        const dto: OAuthDto = {
            email: profile.emails[0].value,
            intra: profile.username
        }
        console.log("Validation")
        console.log(dto);
        //TODO undefined checks
        const user = await this.authService.validateUser(dto);
        return user || null
    }
}