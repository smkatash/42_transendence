import { BadRequestException, Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Param, Patch, Post, Res, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { User } from './entities/user.entity';
import { GetUser } from 'src/auth/utils/get-user.decorator';
import { SessionGuard } from 'src/auth/guard/auth.guard';
import * as path from 'path';


export const localStorage = {
    storage: diskStorage({
    destination: './uploads/images',
    filename: (req, file, cb) => {
        const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuid()
        const extention: string = path.parse(file.originalname).ext
        cb(null, `${filename}${extention}`)
    }
})}

@Controller('user')
export class UserController {
    constructor(@Inject(UserService) private userService: UserService) {}

    @Get('profile')
    @UseGuards(SessionGuard)
    async getUserInfo(@GetUser() currentUser: User) {
        if (currentUser && currentUser.id) {
            return await this.userService.getUserById(currentUser.id)
        } else {
            throw new UnauthorizedException('Access denied');
        }
    }

	@Patch('username')
	@UseGuards(SessionGuard)
	async updateUsername(@Body('username') newName: string, @GetUser() currentUser: User) {
		if (currentUser && currentUser.id) {
			try {
                return await this.userService.updateUsername(currentUser.id, newName)
			} catch (error) {
				throw new HttpException(`${newName} username already exists`, HttpStatus.CONFLICT)
			}
		} else {
			throw new UnauthorizedException('Access denied');
		}
	}

	@Patch('title')
	@UseGuards(SessionGuard)
	async updateTitle(@Body('title') newTitle: string, @GetUser() currentUser: User) {
		if (currentUser && currentUser.id) {
			return await this.userService.updateTitle(currentUser.id, newTitle)	
		} else {
			throw new UnauthorizedException('Access denied');
		}
	}

	@Patch('enable-mfa')
	@UseGuards(SessionGuard)
	async enableMfaWithEmail(@Body('email') newEmail: string, @GetUser() currentUser: User) {
		if (currentUser && currentUser.id) {
			return await this.userService.enableMfaVerification(currentUser.id, newEmail)
		} else {
			throw new UnauthorizedException('Access denied');
		}
	}

	@Patch('disable-mfa')
	@UseGuards(SessionGuard)
	async disableMfaWithEmail(@GetUser() currentUser: User) {
		if (currentUser && currentUser.id) {
			return await this.userService.disableMfaVerification(currentUser.id)
		} else {
			throw new UnauthorizedException('Access denied');
		}
	}


    @Post('image/upload')
    @UseGuards(SessionGuard)
    @UseInterceptors(FileInterceptor('image', localStorage))
    async uploadAvatar(@GetUser() currentUser: User, @UploadedFile() file: Express.Multer.File) {
        if (currentUser && currentUser.id) {
            return await this.userService.updateUserAvatar(currentUser.id, file.filename)
        } else {
            throw new UnauthorizedException('Access denied');
        }
    }

    @Get('image/:avatar')
    @UseGuards(SessionGuard)
    getUserAvatar(@Param('avatar') avatar: string, @Res() res) {
		if (avatar) {
			return res.sendFile(path.join(process.cwd(),'uploads/images/' + avatar))
		} else {
			throw new BadRequestException('Avatar not provided')
		}
    }

    @Get('friends')
    @UseGuards(SessionGuard)
    async getCurrentUserFriends(@GetUser() currentUser: User) {
        if (currentUser && currentUser.id) {
            const friends: User[] = await this.userService.getUserFriends(currentUser.id)
            return friends
        } else {
            throw new UnauthorizedException('Access denied');
        }
    }

    @Get(':id/friends')
    @UseGuards(SessionGuard)
    async getUserFriends(@Param('id') userId: string, @GetUser() currentUser: User) {
        if (currentUser && currentUser.id && userId) {
            const friends: User[] = await this.userService.getUserFriends(userId)
            return friends
        } else {
            throw new UnauthorizedException('Access denied');
        }
    }

    @Patch('add-friend')
    @UseGuards(SessionGuard)
    async addNewFriend(@Body('friendId') friendId: string, @GetUser() currentUser: User) {
        if (currentUser && currentUser.id && friendId) {
           return await this.userService.addUserFriend(currentUser.id, friendId)
        } else {
            throw new UnauthorizedException('Access denied');
        }
    }

	@Post('request-friend')
    @UseGuards(SessionGuard)
    async sendFriendRequest(@Body('friendId') friendId: string, @GetUser() currentUser: User) {
        if (currentUser && currentUser.id && friendId) {
           return await this.userService.sendFriendRequest(currentUser.id, friendId)
        } else {
            throw new UnauthorizedException('Access denied');
        }
    }


    @Delete('friend/:id')
    @UseGuards(SessionGuard)
    async deleteUserFriend(@Param('id') friendId: string, 
                            @GetUser() currentUser: User) {
        if (currentUser && currentUser.id && friendId) {
            return await this.userService.removeUserFriend(currentUser.id, friendId);
        } else {
            throw new UnauthorizedException('Access denied');
        }
    }

	@Get('profile/:id')
    @UseGuards(SessionGuard)
    async getUsersInfo(@Param('id') userId: string, @GetUser() currentUser: User) {
		if (currentUser && currentUser.id && userId) {
			return await this.userService.getUserById(userId)
		} else {
		throw new UnauthorizedException('Access denied');
	}

    }

}

