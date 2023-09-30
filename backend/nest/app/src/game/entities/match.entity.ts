import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryColumn } from "typeorm";
import { GameState } from "../utls/game";
import { Player } from "./player.entity";

@Entity({name: 'matches'})
export class Match {
    @PrimaryColumn({unique: true})
    id: string

    @Column({default: GameState.READY})
    status: GameState

    @ManyToMany(() => Player, (player) => player.matches, {nullable: true})
    @JoinTable()
    players: Player[]

    @ManyToMany(() => Player, (player) => player.matches, {nullable: true})
    observers: Player[]
    
    @ManyToOne(() => Player, { nullable: true })
    @JoinColumn({ name: 'winnerId' })
    winner: Player
    
    @ManyToOne(() => Player, { nullable: true })
    @JoinColumn({ name: 'loserId' })
    loser: Player

    @Column({ type: 'jsonb', nullable: true, default: null })
    scores: Record<string, number>
}