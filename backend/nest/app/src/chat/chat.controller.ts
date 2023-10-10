import { Body, Controller, Get, HttpException, HttpStatus, Logger, Param, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ChatService } from './service/chat.service';
import { SessionGuard } from 'src/auth/guard/auth.guard';
import { GetUser } from 'src/auth/utils/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { createChannelDto } from './dto/createChannel.dto';

@Controller('chat')
@UseGuards(SessionGuard)

export class ChatController {
    constructor(
        private readonly chatService: ChatService
    ){}

    @Get('all')
    // @UseGuards(SessionGuard)
    async getAllChats(@GetUser() user: User)    {
        if (user && user.id)    {
            return await this.chatService.getChats();
        } else  {
            throw new UnauthorizedException('Access denied')
        }
    }

    @Get()
    // @UseGuards(SessionGuard)
    async getChats(@GetUser() user: User)   {
        if (user && user.id)    {
            return await this.chatService.getUsersChats(Number(user.id));
        } else  {
            throw new UnauthorizedException('Access denied')
        }
    }

    //TODO validation pipe?!
    @Post('create')
    // @UseGuards(SessionGuard)
    async createChannel(
        @GetUser() user: User,
        @Body() channelInfo: createChannelDto
    )    {
        if (user?.id)   {
            const regex = /^[a-zA-Z0-9]{1, 16}$/;
            if (!regex.test(channelInfo.name) || !regex.test(channelInfo.topic))    {
                throw new HttpException('Bad naming', HttpStatus.BAD_REQUEST)
            }
            return  this.chatService.newChannel(channelInfo, user);
        }   else    {
            throw new UnauthorizedException('Access denied') 
        }
    }

    @Post('add-admin/:id')
    async addAdmin(
        @GetUser() user: User,
        @Body() body: any
    )   {
        if (user?.id)   {
            return this.chatService

        }   else{
            throw new UnauthorizedException('Access denied')
        }
    }

}
