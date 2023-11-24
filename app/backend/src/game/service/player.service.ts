import { Injectable, UnprocessableEntityException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { validate } from "class-validator";
import { Player } from "../entities/player.entity";
import { User } from "src/user/entities/user.entity";
import { GameState } from "../utls/game";

@Injectable()
export class PlayerService {
  constructor(@InjectRepository(Player) private playerRepo: Repository<Player>) {}

  createPlayer(user: User): Promise<Player> {
    const newPlayer: Player = {
      id: user.id,
      user: user,
      score: 0,
      matches: [],
      gameState: GameState.START,
    };

    const player = this.playerRepo.create(newPlayer);
    return this.playerRepo.save(player);
  }

  async getPlayerById(id: string): Promise<Player> {
    return this.playerRepo.findOneBy({ id });
  }

  async getUserByPlayerId(id: string): Promise<Player> {
    return this.playerRepo.findOne({ where: { id }, relations: ["user"] });
  }

  async getPlayerByUser(user: User): Promise<Player> {
    const currentPlayer = await this.getPlayerById(user.id);
    if (currentPlayer) {
      return currentPlayer;
    }

    return this.createPlayer(user);
  }

  async saveValidPlayer(player: Player) {
    const validate_error = await validate(player);
    if (validate_error.length > 0) {
      throw new UnprocessableEntityException("Invalid player format");
    }
    return this.playerRepo.save(player);
  }

  async updatePlayerScore(players: Player[], score: Record<string, number>) {
    for (const player of players) {
      player.score += score[player.id];
    }

    return this.playerRepo.save(players);
  }

  async updatePlayerState(player: Player, state: GameState) {
    player.gameState = state;
    return this.saveValidPlayer(player);
  }

  async getInvitedPlayers(currentPlayerId: string, invitedPlayerId: string): Promise<Player[]> {
    const playerOne: Player = await this.getPlayerById(currentPlayerId);
    const playerTwo: Player = await this.getPlayerById(invitedPlayerId);

    return [playerOne, playerTwo];
  }

  getPlayers(): Promise<Player[]> {
    return this.playerRepo.find();
  }

  getPlayersProfile(): Promise<Player[]> {
    return this.playerRepo.find({
      relations: ["user"],
    });
  }
}
