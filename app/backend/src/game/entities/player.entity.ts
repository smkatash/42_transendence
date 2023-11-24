import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToMany, OneToOne, PrimaryColumn } from "typeorm";
import { Match } from "./match.entity";
import { GameState } from "../utls/game";

@Entity({ name: "players" })
export class Player {
  @PrimaryColumn({ unique: true })
  id: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({ default: 0 })
  score: number;

  @ManyToMany(() => Match, match => match.players, { nullable: true })
  matches: Match[] | [];

  @Column({ default: GameState.START })
  gameState: GameState;
}
