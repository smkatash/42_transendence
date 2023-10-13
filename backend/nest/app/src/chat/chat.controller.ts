import { Body, Controller, Delete, Get, HttpException, HttpStatus, Logger, Param, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ChatService } from './service/chat.service';
import { SessionGuard } from 'src/auth/guard/auth.guard';
import { GetUser } from 'src/auth/utils/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { CreateChannelDto, JoinChannelDto } from './dto/channel.dto';

@Controller('chat')
// @UseGuards(SessionGuard)

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
        // @GetUser() user: User,
        @Body() channelInfo: CreateChannelDto
    )    {
        let user: User =  new User();
        user.id = '1';
        user.username = 'test1'
        // user.channels =  []
        console.log(user)

        
        

        if (user?.id)   {
            const regex = /^[a-zA-Z0-9]{1,16}$/;
            console.log(regex.test(channelInfo.name))
            console.log(channelInfo.name)
            if (!regex.test(channelInfo.name) /*|| !regex.test(channelInfo.topic)*/)    {
                throw new HttpException('Bad naming', HttpStatus.BAD_REQUEST)
            }
            return  this.chatService.newChannel(channelInfo, user);
        }   else    {
            throw new UnauthorizedException('Access denied') 
        }
    }

    @Post('join')
    async join(
        @GetUser() user: User,
        @Body() joinDto: JoinChannelDto
    ){
        if (user?.id)   {
            return this.chatService.join(user, joinDto)
        }   else    {
            throw new UnauthorizedException('Access denied')
        }
    }

    @Post('add-admin')
    async addAdmin(
        @GetUser() user: User,
        @Body() body: any
    )   {
        if (user?.id)   {
            return
            // return this.chatService

        }   else{
            throw new UnauthorizedException('Access denied')
        }
    }

    @Delete('#/:id')
    async deleteChannel(
        @GetUser() user: User,
        @Param('id') channelId: string
    ){
        if (user?.id)   {
            return this.chatService.deleteChat(user, Number(channelId));
        }   else{
            throw new UnauthorizedException('Access denied')
        }
    }
}
