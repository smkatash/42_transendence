import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-42";
import { User } from "src/user/entities/user.entity";
import { Status } from "src/user/utils/status.enum";
import { CALLBACK_URL, CLIENT_ID, CLIENT_SECRET } from "src/utils/Constants";
import { AuthService } from "../service/auth.service";
import { AuthUserDto } from "../utils/auth.user.dto";
import { Profile } from "../utils/profile";

@Injectable()
export class OauthStrategy extends PassportStrategy(Strategy, "42") {
  constructor(@Inject("AUTH_SERVICE") private authService: AuthService) {
    super({
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
      profileFields: {
        id: function (obj) {
          return String(obj.id);
        },
        login: "login",
        image_url: function (obj) {
          return obj.image.link;
        },
        titles: "titles",
      },
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<User> {
    let title = "Pong Master";
    if (profile.titles && profile.titles[0]) {
      title = profile.titles[0].name.replace(/%login\s*(,|$)/g, "");
    }

    const authUserDto: AuthUserDto = {
      id: profile.id,
      username: profile.login,
      title: title,
      avatar: profile.image_url,
      status: Status.ONLINE,
    };

    const user = await this.authService.validateUser(authUserDto);
    if (!user) {
      throw new UnauthorizedException("Access denied");
    }
    return user;
  }
}
