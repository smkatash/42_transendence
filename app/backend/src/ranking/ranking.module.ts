import { Module } from "@nestjs/common";
import { RankingController } from "./ranking.controller";
import { RankingService } from "./service/ranking.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Match } from "src/game/entities/match.entity";
import { Player } from "src/game/entities/player.entity";
import { PassportModule } from "@nestjs/passport";
import { GameModule } from "src/game/game.module";
import { UserModule } from "src/user/user.module";

@Module({
  controllers: [RankingController],
  providers: [RankingService],
  imports: [TypeOrmModule.forFeature([Match, Player]), PassportModule, GameModule, UserModule],
})
export class RankingModule {}
