import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GameStatus } from "../utls/game";
import { Player } from "./player.entity";

@Entity({name: 'match'})
export class Match {
    @PrimaryGeneratedColumn()
    id: string

    @Column({default: GameStatus.WAITING})
    status: GameStatus

    @ManyToMany(() => Player, (player) => player.matches, {nullable: true})
    players: Player[]

    @ManyToMany(() => Player, (player) => player.matches, {nullable: true})
    observers: Player[]
    
    @ManyToOne(() => Player, { nullable: true })
    winner: Player
    
    @ManyToOne(() => Player, { nullable: true })
    looser: Player

    @Column({ type: 'jsonb', nullable: true })
    scores: Record<string, number>;
}