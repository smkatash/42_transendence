import { Injectable } from '@nestjs/common';
import { error } from 'console';
import { OAuthDto } from 'src/auth/dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService)  {}
    async getUser(dto: OAuthDto)    {
        console.log('UserService', dto)
        let user = await this.prisma.users.findUnique({
            where:  {
                email: dto.email
            },
        });
        if (user)   {
            console.log(user)
        //TODO what to return
            return user
        }   else    {
            return this.prisma.users.create({
                data:   {
                    email: dto.email,
                    intra: dto.intra,
                    username: dto.intra
                }, 
            })
            .then(newUser => {
                console.log('new user');
                console.log(newUser)
                //TODO what to return
                return newUser

            })
            .catch(error => {
                console.error('Error creating entry in db', error)
                return null
            });
        }
        }
        async findUserByEmail(email: string){
            const user = await this.prisma.users.findUnique({
                where:  {
                    email: email,
                }
            })
            return user;
        }
}
