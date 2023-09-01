import { Controller, Get, Inject, Param, Post, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
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
        return await this.userService.getUserById(user.id)
    }

    @Post('upload')
    @UseGuards(SessionGuard)
    @UseInterceptors(FileInterceptor('image', localStorage))
    async uploadAvatar(@GetUser() user: User, @UploadedFile() file: Express.Multer.File) {
        return await this.userService.updateUserAvatar(user.id, file.filename)
    }

    @Get('image/:avatar')
    @UseGuards(SessionGuard)
    getUserAvatar(@Param('avatar') avatar: string, @Res() res) {
        return res.sendFile(path.join(process.cwd(),'uploads/images/' + avatar))
    }

}

