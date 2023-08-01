import { Controller, Get, Inject, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { OauthGuard } from 'src/auth/guard/oauth.guard';
import { User } from './entities/user.entity';

@Controller('user')
export class UserController {
    constructor(@Inject(UserService) private userService: UserService) {}

    @Get('info')
    getUserInfo(@Req() request: Request) {
        const user: Partial<User> = request.user
        return this.userService.getUserById(user.id)
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads/images',
                filename: (req, file, cb) => {
                    const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuid()
                    const extention = path.parse(file.originalname).ext
                    cb(null, `${filename}${extention}` )
                }
            }),
        }))
    uploadAvatar(@UploadedFile() file: Express.Multer.File) {
        console.log(file);
        return {imagePath: file.path}
    }

}

