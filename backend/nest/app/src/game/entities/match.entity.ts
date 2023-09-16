import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryColumn } from "typeorm";
import { GameStatus } from "../utls/game";
import { Player } from "./player.entity";

@Entity({name: 'match'})
export class Match {
    @PrimaryColumn({unique: true})
    id: string

    @Column({default: GameStatus.WAITING})
    status: GameStatus

    @ManyToMany(() => Player, (player) => player.matches, {nullable: true})
    @JoinTable()
    players: Player[]

    @ManyToMany(() => Player, (player) => player.matches, {nullable: true})
    observers: Player[]
    
    @ManyToOne(() => Player, { nullable: true })
    winner: Player
    
    @ManyToOne(() => Player, { nullable: true })
    looser: Player

    @Column({ type: 'jsonb', nullable: true, default: null })
    scores: Record<string, number>
}