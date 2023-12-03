import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { GameState } from "../utls/game";
import { Player } from "./player.entity";

@Entity({ name: "matches" })
export class Match {
  @PrimaryColumn({ unique: true })
  id: string;

  @Column({ default: GameState.READY })
  status: GameState;

  @ManyToMany(() => Player, player => player.matches, { nullable: true })
  @JoinTable()
  players: Player[];

  @ManyToOne(() => Player, { nullable: true })
  @JoinColumn({ name: "winnerId" })
  winner: Player;

  @ManyToOne(() => Player, { nullable: true })
  @JoinColumn({ name: "loserId" })
  loser: Player;

  @Column({ type: "jsonb", nullable: true, default: null })
  scores: Record<string, number>;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt: Date;
}
