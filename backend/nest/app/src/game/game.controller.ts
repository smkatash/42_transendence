import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/utils/get-user.decorator';
import { User } from 'src/user/entities/user.entity';


@Controller('game')
export class GameController {

    constructor() {

    }

    @Get('create')
    @UseGuards(AuthGuard)
    handleCreate(@GetUser() user: User) {
        
    }

    @Get('join')
    @UseGuards(AuthGuard)
    handleJoin(@GetUser() user: User) {
        
    }


    @Get('play')
    @UseGuards(AuthGuard)
    handlePlay(@GetUser() user: User) {
        
    }





}
