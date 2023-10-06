import { BadRequestException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { AuthUserDto } from 'src/auth/utils/auth.user.dto';
import { validate } from 'class-validator';
import { Status } from './utils/status.dto';
import { Player } from 'src/game/entities/player.entity';
import * as https from 'https';
import * as fs from 'fs';

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

    async getUserById(id: string): Promise<User> {
      return this.userRepo.findOneBy({id})
    }
    
    async saveValidUser(user: User) {
      const validate_error = await validate(user);
      if (validate_error.length > 0) {
        throw new BadRequestException();
      }
      return this.userRepo.save(user);
    }

    async createUser(newUser: AuthUserDto): Promise<User> {
      const user = this.userRepo.create(newUser)
      return this.userRepo.save(user)
    }

    async updateUserStatus(id: string, status: Status) {
        const user = await this.getUserById(id)
        user.status = status;
        return this.saveValidUser(user)
    }

    async updateUserAvatar(id: string, image: string): Promise<User> {
      const user = await this.getUserById(id)
      user.avatar = image
      return this.saveValidUser(user)
    }

	async updateUsername(id: string, newName: string): Promise<User> {
		const user = await this.getUserById(id)
		user.username = newName
		return this.saveValidUser(user)
	}

	async updateTitle(id: string, newTitle: string): Promise<User> {
		const user = await this.getUserById(id)
		user.title = newTitle
		return this.saveValidUser(user)
	}

    async getUserFriends(id: string) {
      try {
        const currentUser: User = await this.userRepo.findOne({
          where: {id}, relations: ['friends']
        })

        if (!currentUser) {
          throw new HttpException('User not found', 404)
        }
  
        return currentUser.friends
      } catch(err) {
        throw new InternalServerErrorException()
      }
    } 

    async addUserFriend(id: string, friendId: string) {
      try {
        const currentUser: User = await this.userRepo.findOne({
          where: {id}, relations: ['friends']
        })
        const friend = await this.userRepo.findOne({where: {id: friendId}})

        if (!currentUser || !friend) {
          throw new HttpException('User not found', 404)
        }

        currentUser.friends.push(friend)
        friend.friendOf.push(currentUser)

        return this.userRepo.save([currentUser, friend])
      } catch (err) {
        throw new InternalServerErrorException()
      }
    }

    async removeUserFriend(id: string, friendId: string) {
      try {
        const currentUser = await this.userRepo.findOneOrFail({ where: {id}, relations: ['friends']})
        const friendToRemove = await this.userRepo.findOneOrFail({where: {id: friendId}, relations: ['friendOf']})
        if (!currentUser || !friendToRemove) {
          throw new HttpException('User not found', 404)
        }

        currentUser.friends = currentUser.friends.filter((u) => u.id !== friendId)
        friendToRemove.friendOf = friendToRemove.friendOf.filter((u) => u.id !== id)

        return await this.userRepo.save([currentUser, friendToRemove])
      } catch (err) {
        throw new InternalServerErrorException()
      }
    }

	async getIntraProfile(imageUrl: string): Promise<string> {
		const imageSplit = imageUrl.split('/')
		const imageName = imageSplit[imageSplit.length - 1]
		const file = fs.createWriteStream(`./uploads/images/${imageName}`)

		https.get(imageUrl, response => {
		response.pipe(file);

		file.on('finish', () => {
			file.close()
		});
		}).on('error', err => {
			throw new InternalServerErrorException('Failed to get the user profile')
		});
		return imageName ?? ''
	}

}
