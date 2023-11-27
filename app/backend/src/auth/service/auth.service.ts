import { Injectable, NotFoundException} from "@nestjs/common";
import { User } from "src/user/entities/user.entity";
import { AuthUserDto } from "src/auth/utils/auth.user.dto";
import { v4 } from "uuid";
import { UserService } from "../../user/service/user.service";
import { Status } from "src/user/utils/status.enum";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthToken } from "../entities/auth-token.entity";
import { Repository } from "typeorm";
import { createHash } from "crypto";
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';

@Injectable()
export class AuthService {
  constructor(private userService: UserService, @InjectRepository(AuthToken) private tokenRepo: Repository<AuthToken>) {}

  async validateUser(authUserDto: AuthUserDto): Promise<User> {
    let currentUser: User;

    try {
      currentUser = await this.userService.getUserById(authUserDto.id);
    //   if (currentUser.status !== Status.ONLINE) {
    //   	throw new BadRequestException("User is logged in.")
    //   }
    } catch (error) {
      if (error instanceof NotFoundException) {
        authUserDto.avatar = await this.userService.getIntraProfile(authUserDto.avatar);
        return this.userService.createUser(authUserDto);
      }
      throw error;
    }
    return currentUser;
  }
  
  randomUsernamePrefixGenerator() {
    const dictionaries = [adjectives, colors, animals];
    const selectedDictionary = dictionaries[Math.floor(Math.random() * dictionaries.length)];

    return uniqueNamesGenerator({
      dictionaries: [selectedDictionary]
    });
  }

  async findUser(id: string): Promise<User> {
    return this.userService.getUserById(id);
  }

  async updateUserStatus(id: string, status: Status) {
    return this.userService.updateUserStatus(id, status);
  }

  async createAuthToken(userId: string) {
    const newToken = this.generateToken(userId);
    const token = this.tokenRepo.create(newToken);
    return this.tokenRepo.save(token);
  }

  async isValidTokenData(userId: string, value: string) {
    const expiresIn = 1000 * 60 * 2;
    const token: AuthToken = await this.tokenRepo.findOneBy({ value });

    if (token) {
      if (token.userId == userId && Date.now() - token.expires < expiresIn) {
        return true;
      }
    }
    return false;
  }

  async removeToken(value: string) {
    return await this.tokenRepo.delete(value);
  }

  generateToken(userId: string) {
    const token: AuthToken = {
      value: this.getRandomCode(),
      userId: userId,
      expires: Date.now(),
    };
    return token;
  }

  private getRandomCode(): string {
    const randomString = v4().replace(/-/g, "");
    const hash = createHash("sha256").update(randomString).digest("hex");
    const baseHash = Buffer.from(hash, "hex").toString("base64");
    return baseHash.slice(0, 8);
  }

  async deleteExpiredTokens() {
    const currentTimestamp = Date.now();
    return this.tokenRepo.createQueryBuilder().delete().where("expires < :currentTimestamp", { currentTimestamp }).execute();
  }

  async getAllTokens() {
    return this.tokenRepo.find();
  }
}
