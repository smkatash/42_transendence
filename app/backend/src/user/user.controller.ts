import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import * as path from "path";
import { SessionGuard } from "src/auth/guard/auth.guard";
import { GetUser } from "src/auth/utils/get-user.decorator";
import { IMAGE_UPLOADS_PATH, POSTGRES_UNIQUE_VIOLATION } from "src/utils/Constants";
import { v4 as uuid } from "uuid";
import { User } from "./entities/user.entity";
import { UserService } from "./service/user.service";
import { BlockUserDto, FriendIdDto, ParamAvatarDto, ParamUserIdDto, UnblockUserDto, UpdateEmailDto, UpdateTitleDto, UpdateUsernameDto } from "./utils/entity.dto";
import { SessionUserDto } from "./utils/user.dto";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";

export const localStorage: MulterOptions = {
  storage: diskStorage({
    destination: IMAGE_UPLOADS_PATH,
    filename: (req, file, cb) => {
      const filename: string = path.parse(file.originalname).name.replace(/\s/g, "") + uuid();
      const extention: string = path.parse(file.originalname).ext;
      cb(null, `${filename}${extention}`);
    },
  }),
  limits: {
	fileSize: 10 * 1024 * 1024
  }
};

@Controller("user")
export class UserController {
  private readonly logger = new Logger();

  constructor(@Inject(UserService) private userService: UserService) {}

  @Get("profile")
  @UseGuards(SessionGuard)
  async getUserInfo(@GetUser() currentUser: SessionUserDto) {
    if (!currentUser) {
      throw new UnauthorizedException("Access denied");
    }

    try {
      return await this.userService.getUserById(currentUser.id);
    } catch (error) {
      throw error;
    }
  }

  @Patch("username")
  @UseGuards(SessionGuard)
  async updateUsername(@Body() updateUsernameDto: UpdateUsernameDto, @GetUser() currentUser: SessionUserDto) {
    if (!currentUser) {
      throw new UnauthorizedException("Access denied");
    }

    try {
      return await this.userService.updateUsername(currentUser.id, updateUsernameDto.username);
    } catch (error) {
      if (error.code === POSTGRES_UNIQUE_VIOLATION) {
        throw new ConflictException(`${updateUsernameDto.username} username already exists`);
      } else {
        throw error;
      }
    }
  }

  @Patch("title")
  @UseGuards(SessionGuard)
  async updateTitle(@Body() updateTitleDto: UpdateTitleDto, @GetUser() currentUser: SessionUserDto) {
    if (!currentUser) {
      throw new UnauthorizedException("Access denied");
    }

    try {
      return await this.userService.updateTitle(currentUser.id, updateTitleDto.title);
    } catch (error) {
      throw error;
    }
  }

  @Patch("enable-mfa")
  @UseGuards(SessionGuard)
  async enableMfaWithEmail(@Body() updateEmailDto: UpdateEmailDto, @GetUser() currentUser: SessionUserDto) {
    if (!currentUser) {
      throw new UnauthorizedException("Access denied");
    }

    try {
      return await this.userService.enableMfaEmail(currentUser.id, updateEmailDto.email);
    } catch (error) {
      throw error;
    }
  }

  @Patch("disable-mfa")
  @UseGuards(SessionGuard)
  async disableMfaWithEmail(@GetUser() currentUser: SessionUserDto) {
    if (!currentUser) {
      throw new UnauthorizedException("Access denied");
    }
    try {
      return await this.userService.disableMfaVerification(currentUser.id);
    } catch (error) {
      throw error;
    }
  }

  @Post("image/upload")
  @UseGuards(SessionGuard)
  @UseInterceptors(FileInterceptor("image", localStorage))
  async uploadAvatar(@GetUser() currentUser: SessionUserDto, @UploadedFile() file: Express.Multer.File) {
    if (!currentUser) {
      throw new UnauthorizedException("Access denied");
    }

    try {
      return await this.userService.updateUserAvatar(currentUser.id, file.filename);
    } catch (error) {
      throw error;
    }
  }

  @Get("image/:avatar")
  @UseGuards(SessionGuard)
  getUserAvatar(@GetUser() currentUser: SessionUserDto, @Param() paramAvatarDto: ParamAvatarDto, @Res() res) {
    if (!currentUser) {
      throw new UnauthorizedException("Access denied");
    }

    try {
      return res.sendFile(path.join(process.cwd(), IMAGE_UPLOADS_PATH + paramAvatarDto.avatar));
    } catch (error) {
      throw error;
    }
  }

  @Get("friends")
  @UseGuards(SessionGuard)
  async getCurrentUserFriends(@GetUser() currentUser: SessionUserDto) {
    if (!currentUser) {
      throw new UnauthorizedException("Access denied");
    }

    try {
      const friends: User[] = await this.userService.getUserFriends(currentUser.id);
      return friends;
    } catch (error) {
      throw error;
    }
  }

  @Get(":id/friends")
  @UseGuards(SessionGuard)
  async getUserFriends(@Param() paramUserIdDto: ParamUserIdDto, @GetUser() currentUser: SessionUserDto) {
    if (!currentUser) {
      throw new UnauthorizedException("Access denied");
    }

    try {
      const friends: User[] = await this.userService.getUserFriends(paramUserIdDto.id);
      return friends;
    } catch (error) {
      throw error;
    }
  }

  @Patch("add-friend")
  @UseGuards(SessionGuard)
  async addNewFriend(@Body() friendIdDto: FriendIdDto, @GetUser() currentUser: SessionUserDto) {
    if (!currentUser) {
      throw new UnauthorizedException("Access denied");
    }

    try {
      return await this.userService.addUserFriend(currentUser.id, friendIdDto.friendId);
    } catch (error) {
      throw error;
    }
  }

  @Patch("decline-friend")
  @UseGuards(SessionGuard)
  async declineNewFriend(@Body() friendIdDto: FriendIdDto, @GetUser() currentUser: SessionUserDto) {
    if (!currentUser) {
      throw new UnauthorizedException("Access denied");
    }

    try {
      return await this.userService.declineUserFriend(currentUser.id, friendIdDto.friendId);
    } catch (error) {
      throw error;
    }
  }

  @Post("request-friend")
  @UseGuards(SessionGuard)
  async sendFriendRequest(@Body() friendIdDto: FriendIdDto, @GetUser() currentUser: SessionUserDto) {
    if (!currentUser) {
      throw new UnauthorizedException("Access denied");
    }

    try {
      return await this.userService.sendFriendRequest(currentUser.id, friendIdDto.friendId);
    } catch (error) {
      throw error;
    }
  }

  @Get("block")
  @UseGuards(SessionGuard)
  async handleBlockUser(@Body() blockUserDto: BlockUserDto, @GetUser() currentUser: SessionUserDto) {
    if (!currentUser) {
      throw new UnauthorizedException("Access denied");
    }

    try {
      return await this.userService.blockUser(currentUser.id, blockUserDto.blockId);
    } catch (error) {
      throw error;
    }
  }

  @Post("unblock")
  @UseGuards(SessionGuard)
  async handleUnblockUser(@Body() unblockUserDto: UnblockUserDto, @GetUser() currentUser: SessionUserDto) {
    if (!currentUser) {
      throw new UnauthorizedException("Access denied");
    }

    try {
      return await this.userService.unBlockUser(currentUser.id, unblockUserDto.unblockId);
    } catch (error) {
      throw error;
    }
  }

  @Delete("friend/:friendId")
  @UseGuards(SessionGuard)
  async deleteUserFriend(@Param() friendIdDto: FriendIdDto, @GetUser() currentUser: SessionUserDto) {
    if (!currentUser) {
      throw new UnauthorizedException("Access denied");
    }

    try {
      return await this.userService.removeUserFriend(currentUser.id, friendIdDto.friendId);
    } catch (error) {
      throw error;
    }
  }

  @Get("profile/:id")
  @UseGuards(SessionGuard)
  async getUsersInfo(@Param() paramUserIdDto: ParamUserIdDto, @GetUser() currentUser: SessionUserDto) {
    if (!currentUser) {
      throw new UnauthorizedException("Access denied");
    }
	
    try {
      return await this.userService.getUserById(paramUserIdDto.id);
    } catch (error) {
    	throw error;
    }
  }

  @Get("friends/pending")
  @UseGuards(SessionGuard)
  async getPendingFriendRequests(@GetUser() currentUser: SessionUserDto) {
    if (!currentUser) {
      throw new UnauthorizedException("Access denied");
    }

    try {
      return await this.userService.getPendingFriendRequests(currentUser.id);
    } catch (error) {
      throw error;
    }
  }

  @Get("friends/requests")
  @UseGuards(SessionGuard)
  async getSentFriendRequests(@GetUser() currentUser: SessionUserDto) {
    if (!currentUser) {
      throw new UnauthorizedException("Access denied");
    }

    try {
      return await this.userService.getSentFriendRequests(currentUser.id);
    } catch (error) {
      throw error;
    }
  }

  @Get("find-by-username")
  @UseGuards(SessionGuard)
  async getAllByUsername(@GetUser() user: User, @Query("username") username: string) {
    if (user?.id) {
      const u = await this.userService.getUserWith(user.id, ["blockedUsers"]);
      const users: User[] = await this.userService.findAllByUsername(username);
      return users
        .filter(us => !us.blockedUsers.some(uu => uu.id === u.id))
        .filter(us => !u.blockedUsers.some(uu => uu.id === us.id))
        .filter(us => us.id !== user.id);
    }
    throw new UnauthorizedException("Access denied");
  }

  @Get(":id/blocked")
  @UseGuards(SessionGuard)
  async getUserBlocklistInfo(@Param() paramUserIdDto: ParamUserIdDto, @GetUser() currentUser: SessionUserDto) {
    if (!currentUser) {
      throw new UnauthorizedException("Access denied");
    }
	
    try {
      return await this.userService.getBlockedUsersById(paramUserIdDto.id);
    } catch (error) {
    	throw error;
    }
  }
}
