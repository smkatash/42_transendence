import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { AuthUserDto } from 'src/auth/utils/auth.user.dto';
import { validate } from 'class-validator';
import { Status } from './utils/status.dto';
import * as https from 'https';
import * as fs from 'fs';
import { MfaStatus } from 'src/auth/utils/mfa-status';

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

    async getUserById(id: string): Promise<User> {
      return this.userRepo.findOneBy({id})
    }

	async logoutUser(id: string) {
		const user = await this.getUserById(id)
		user.status = Status.OFFLINE
		user.mfaStatus = MfaStatus.DENY
		return this.saveValidUser(user)
	}

	async verifyUserMfa(id: string) {
		const user = await this.getUserById(id)
		user.status = Status.ONLINE
		user.mfaStatus = MfaStatus.VALIDATE
		return this.saveValidUser(user)
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

	async enableMfaVerification(id: string, email: string): Promise<User> {
		const user = await this.getUserById(id)
		user.mfaEnabled = true
		user.email = email
		user.mfaStatus = MfaStatus.DENY
		user.status = Status.MFAPending
		console.log('user service: ' + email)
		return this.saveValidUser(user)
	}

	async disableMfaVerification(id: string): Promise<User> {
		const user = await this.getUserById(id)
		user.mfaEnabled = false
		user.mfaStatus = MfaStatus.DENY
		return this.saveValidUser(user)
	}

	async setMfaVerificationStatus(id: string, state: MfaStatus) {
		const user = await this.getUserById(id)
		user.mfaStatus = state
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

	async getPendingFriendRequests(id: string): Promise<User[]> {
		const currentUser: User = await this.userRepo.findOne({
			where: {id}, relations: ['pendingFriendRequests']
		})

		return currentUser.pendingFriendRequests
	}

	async getSentFriendRequests(id: string): Promise<User[]> {
		const currentUser: User = await this.userRepo.findOne({
			where: {id}, relations: ['sentFriendRequests']
		})

		return currentUser.sentFriendRequests
	}

	async sendFriendRequest(id: string, friendId: string) {
		const currentUser: User = await this.userRepo.findOne({
			where: {id}, relations: ['friends', 'sentFriendRequests']
		  })
		const newFriend: User = await this.userRepo.findOne({
			where: {id: friendId}
		})

		if (!currentUser || !newFriend) {
			throw new NotFoundException('User not found')
		}
		if (currentUser.friends && currentUser.friends.some((user) => user.id === friendId)) {
			throw new BadRequestException('Friend request already accepted');
		}
		if (currentUser.sentFriendRequests && currentUser.sentFriendRequests.some((user) => user.id === friendId)) {
			throw new BadRequestException('Friend request already sent');
		}

		currentUser.sentFriendRequests.push(newFriend)
		return await this.userRepo.save(currentUser)
	}

    async addUserFriend(id: string, friendId: string) {
        const currentUser: User = await this.userRepo.findOne({
          where: {id}, relations: ['friendOf', 'friends', 'pendingFriendRequests']
        })
		
        const friend = await this.userRepo.findOne({
			where: {id: friendId}, relations: ['sentFriendRequests']
		})

        if (!currentUser || !friend) {
          throw new HttpException('User not found', 404)
        }

		if (currentUser.friends && currentUser.friends.some((user) => user.id === friendId)) {
			throw new BadRequestException('Friend request already accepted');
		}
		currentUser.friendOf.push(friend)
		currentUser.friends.push(friend)
		currentUser.pendingFriendRequests = currentUser.pendingFriendRequests.filter(
			(user) => user.id !== friendId
		)
		friend.sentFriendRequests = friend.sentFriendRequests.filter(
			(user) => user.id !== currentUser.id
		)

		console.log("!!!!!!!!!!!!!!!!!!!!!!!!")
		console.log(currentUser)
		console.log(friend)
		console.log("!!!!!!!!!!!!!!!!!!!!!!!!")
        return this.userRepo.save([currentUser, friend])
    }

	async declineUserFriend(id: string, friendId: string) {
		try {
		  const currentUser = await this.userRepo.findOne({ where: {id}, relations: ['sentFriendRequests']})
		  const friendToDecline = await this.userRepo.findOne({where: {id: friendId}, relations: ['pendingFriendRequests']})
		  if (!currentUser || !friendToDecline) {
			throw new HttpException('User not found', 404)
		  }
  
		  currentUser.sentFriendRequests = currentUser.sentFriendRequests.filter((u) => u.id !== friendId)
		  friendToDecline.pendingFriendRequests = friendToDecline.pendingFriendRequests.filter((u) => u.id !== id)
  
		  return await this.userRepo.save([currentUser, friendToDecline])
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
