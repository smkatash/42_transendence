import { BadRequestException, HttpException, Injectable, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { validate } from "class-validator";
import * as fs from "fs";
import * as https from "https";
import { AuthUserDto } from "src/auth/utils/auth.user.dto";
import { MfaStatus } from "src/auth/utils/mfa-status";
import { IMAGE_UPLOADS_PATH, POSTGRES_UNIQUE_VIOLATION } from "src/utils/Constants";
import { Like, Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { Status } from "../utils/status.enum";
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async getBlockedUsersById(id: string): Promise<User[]> {
    const user = await this.userRepo.findOne({
      where: {id},
      relations: ["blockedUsers"]
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user.blockedUsers;
  }

  async logoutUser(id: string) {
    const user = await this.getUserById(id);
    user.status = Status.OFFLINE;
    user.mfaStatus = MfaStatus.DENY;
    return this.saveValidUser(user);
  }

  async verifyUserMfa(id: string) {
    const user = await this.getUserById(id);
    user.status = Status.ONLINE;
    user.mfaStatus = MfaStatus.VALIDATE;
    return this.saveValidUser(user);
  }

  async saveValidUser(user: User) {
    const validate_error = await validate(user);
    if (validate_error.length > 0) {
      throw new UnprocessableEntityException("Invalid user format");
    }
    return this.userRepo.save(user);
  }

  private randomUsernameGenerator() {
    const uniqueName = uniqueNamesGenerator({
      dictionaries:[adjectives, colors, animals],
      length: 2
    });

    return uniqueName.slice(0, 8);
  }

  async createUser(userDto: AuthUserDto): Promise<User> {
    try {
      const user = this.userRepo.create(userDto);
      const newUser = await this.userRepo.save(user);
      return newUser
    } catch (error) {
      if (error.code === POSTGRES_UNIQUE_VIOLATION)   {
        userDto.username = this.randomUsernameGenerator()
        const user = this.userRepo.create(userDto);
        return this.userRepo.save(user);
      } else {
        throw error;
      }
    }
  }

  async updateUserStatus(id: string, status: Status) {
    const user = await this.getUserById(id);
    user.status = status;
    return this.saveValidUser(user);
  }

  async updateUserAvatar(id: string, image: string): Promise<User> {
    const user = await this.getUserById(id);
    user.avatar = image;
    return this.saveValidUser(user);
  }

  async updateUsername(id: string, newName: string): Promise<User> {
    const user = await this.getUserById(id);
    user.username = newName;
    return this.saveValidUser(user);
  }

  async updateTitle(id: string, newTitle: string): Promise<User> {
    const user = await this.getUserById(id);
    user.title = newTitle;
    return this.saveValidUser(user);
  }

  async enableMfaEmail(id: string, email: string): Promise<User> {
    const user = await this.getUserById(id);
    user.email = email;
    return this.saveValidUser(user);
  }

  async enableMfaVerification(id: string): Promise<User> {
    const user = await this.getUserById(id);
    user.status = Status.ONLINE;
    user.mfaStatus = MfaStatus.VALIDATE;
    user.mfaEnabled = true;
    return this.saveValidUser(user);
  }

  async disableMfaVerification(id: string): Promise<User> {
    const user = await this.getUserById(id);
    user.mfaEnabled = false;
    user.mfaStatus = MfaStatus.DENY;
    return this.saveValidUser(user);
  }

  async setMfaVerificationStatus(id: string, state: MfaStatus) {
    const user = await this.getUserById(id);
    user.mfaStatus = state;
    return this.saveValidUser(user);
  }

  async getUserFriends(id: string) {
    const currentUser: User = await this.userRepo.findOne({
      where: { id },
      relations: ["friends"],
    });

    if (!currentUser) {
      throw new NotFoundException("User not found");
    }

    return currentUser.friends;
  }

  async getPendingFriendRequests(id: string): Promise<User[]> {
    const currentUser: User = await this.userRepo.findOne({
      where: { id },
      relations: ["pendingFriendRequests"],
    });

    return currentUser.pendingFriendRequests;
  }

  async getSentFriendRequests(id: string): Promise<User[]> {
    const currentUser: User = await this.userRepo.findOne({
      where: { id },
      relations: ["sentFriendRequests"],
    });

    return currentUser.sentFriendRequests;
  }

  async sendFriendRequest(id: string, friendId: string) {
    const currentUser: User = await this.userRepo.findOne({
      where: { id },
      relations: ["friends", "sentFriendRequests"],
    });
    const newFriend: User = await this.userRepo.findOne({
      where: { id: friendId },
    });

    if (!currentUser || !newFriend) {
      throw new NotFoundException("User not found");
    }
    if (currentUser.friends && currentUser.friends.some(user => user.id === friendId)) {
      throw new BadRequestException("Friend request already accepted");
    }
    if (currentUser.sentFriendRequests && currentUser.sentFriendRequests.some(user => user.id === friendId)) {
      throw new BadRequestException("Friend request already sent");
    }

    currentUser.sentFriendRequests.push(newFriend);
    return await this.userRepo.save(currentUser);
  }

  async blockUser(id: string, blockId: string) {
    const currentUser: User = await this.userRepo.findOne({
      where: { id },
      relations: ["blockedUsers"],
    });

    const blockUser: User = await this.userRepo.findOne({
      where: { id: blockId },
    });

    if (!currentUser || !blockUser) {
      throw new NotFoundException("User not found");
    }

    if (currentUser.blockedUsers && currentUser.blockedUsers.some(user => user.id === blockId)) {
      throw new BadRequestException("User is blocked");
    }

    currentUser.blockedUsers.push(blockUser);
    return await this.userRepo.save(currentUser);
  }

  async unBlockUser(id: string, unblockId: string) {
    const currentUser: User = await this.userRepo.findOne({
      where: { id },
      relations: ["blockedUsers"],
    });

    const unBlockUser: User = await this.userRepo.findOne({
      where: { id: unblockId },
    });

    if (!currentUser || !unBlockUser) {
      throw new NotFoundException("User not found");
    }

    if (currentUser.blockedUsers && !currentUser.blockedUsers.some(user => user.id === unblockId)) {
      throw new BadRequestException("User is not blocked");
    }

    currentUser.blockedUsers = currentUser.blockedUsers.filter(user => user.id !== unblockId);
    return await this.userRepo.save(currentUser);
  }

  async addUserFriend(id: string, friendId: string) {
    const currentUser: User = await this.userRepo.findOne({
      where: { id },
      relations: ["friendOf", "friends", "sentFriendRequests", "pendingFriendRequests"],
    });

    const friend = await this.userRepo.findOne({
      where: { id: friendId },
    });

    if (!currentUser || !friend) {
      throw new NotFoundException("User not found");
    }

    if (currentUser.friends && currentUser.friends.some(user => user.id === friendId)) {
      throw new BadRequestException("Friend request already accepted");
    }

    currentUser.friendOf.push(friend);
    currentUser.friends.push(friend);
    currentUser.pendingFriendRequests = currentUser.pendingFriendRequests.filter(user => user.id !== friendId);
    currentUser.sentFriendRequests = currentUser.sentFriendRequests.filter(user => user.id !== friendId);
    return this.userRepo.save(currentUser);
  }

  async declineUserFriend(id: string, friendId: string) {
    const currentUser = await this.userRepo.findOne({
      where: { id },
      relations: ["sentFriendRequests", "pendingFriendRequests"],
    });
    const friendToDecline = await this.userRepo.findOne({
      where: { id: friendId },
    });
    if (!currentUser || !friendToDecline) {
      throw new NotFoundException("User not found");
    }

    currentUser.sentFriendRequests = currentUser.sentFriendRequests.filter(u => u.id !== friendId);
    currentUser.pendingFriendRequests = currentUser.pendingFriendRequests.filter(u => u.id !== friendId);

    return this.userRepo.save(currentUser);
  }

  async removeUserFriend(id: string, friendId: string) {
    try {
      const currentUser = await this.userRepo.findOne({ where: { id }, relations: ["friends", "friendOf"] });
      const friendToRemove = await this.userRepo.findOne({ where: { id: friendId } });
      if (!currentUser || !friendToRemove) {
        throw new HttpException("User not found", 404);
      }

      currentUser.friends = currentUser.friends.filter(u => u.id !== friendId);
      currentUser.friendOf = currentUser.friendOf.filter(u => u.id !== friendId);

      return await this.userRepo.save(currentUser);
    } catch (err) {
      throw new BadRequestException();
    }
  }

  async getIntraProfile(imageUrl: string): Promise<string> {
    const imageSplit = imageUrl.split("/");
    const imageName = imageSplit[imageSplit.length - 1];
    const file = fs.createWriteStream(IMAGE_UPLOADS_PATH + imageName);

    https
      .get(imageUrl, response => {
        response.pipe(file);

        file.on("finish", () => {
          file.close();
        });
      })
      .on("error", err => {
        throw err
      });
    return imageName ?? "";
  }

  //for updates
  async saveUser(user: User) {
    return this.userRepo.save(user);
  }

  //tmp
  async findUserById(id: string) {
    return await this.userRepo.findOne({
      where: {
        id,
      },
    });
  }
  async findAllByUsername(username: string): Promise<User[]> {
    return await this.userRepo.find({
      where: {
        username: Like(`%${username.toLocaleLowerCase()}%`),
      },
      relations: ["blockedUsers"],
    });
  }

  async getUserRelations(id: string) {
    return this.userRepo.findOne({
      where: { id },
      relations: ["channels"],
      // 	['friends', 'friendOf', 'sentFriendRequests', 'pendingFriendRequests',
      // 	'channels'
      // ]
    });
  }

  async getUserWith(id: string, relations: string[]) {
    return await this.userRepo.findOne({
      where: { id },
      relations: relations,
    });
  }
}
