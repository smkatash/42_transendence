import { Body, Controller, Delete, Get, Inject, Param, Post, Res, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { User } from './entities/user.entity';
import { GetUser } from 'src/auth/utils/get-user.decorator';
import { SessionGuard } from 'src/auth/guard/auth.guard';
import path = require('path');


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

    @Get('info')
    @UseGuards(SessionGuard)
    async getUserInfo(@GetUser() user: User) {
        // await this.userService.createUser({ id: '1', username: 'shmandar', email: 'shmandar.com', avatar: 'cat.com', status: 0 })
        return await this.userService.getUserById(user.id)
    }

    @Post(':id/upload')
    @UseGuards(SessionGuard)
    @UseInterceptors(FileInterceptor('image', localStorage))
    async uploadAvatar(@Param('id') id: string, @GetUser() user: User, @UploadedFile() file: Express.Multer.File) {
        if (user.id === id) {
            return await this.userService.updateUserAvatar(user.id, file.filename)
        } else {
            throw new UnauthorizedException('Access denied');
        }
    }

    @Get('image/:avatar')
    @UseGuards(SessionGuard)
    getUserAvatar(@Param('avatar') avatar: string, @Res() res) {
        return res.sendFile(path.join(process.cwd(),'uploads/images/' + avatar))
    }


    @Get(':id/friends')
    @UseGuards(SessionGuard)
    async getUserFriends(@Param('id') id: string, @GetUser() user: User) {
        if (user.id === id) {
            const friends: User[] = await this.userService.getUserFriends(id)
            return friends
        } else {
            throw new UnauthorizedException('Access denied');
        }
    }

    @Post(':id/friend')
    @UseGuards(SessionGuard)
    async addNewFriend(@Param('id') id: string, @Body() friendId: string, @GetUser() user: User) {
        if (user.id === id) {
           return await this.userService.addUserFriend(id, friendId)
        } else {
            throw new UnauthorizedException('Access denied');
        }
    }

    @Delete(':id/friend/:friendId')
    @UseGuards(SessionGuard)
    async deleteUserFriend(@Param('id') id: string, @Param('friendId') friendId: string, 
                            @GetUser() user: User) {
        if (user.id === id) {
            return await this.userService.removeUserFriend(id, friendId);
        } else {
            throw new UnauthorizedException('Access denied');
        }
    }

}

