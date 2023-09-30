import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import { Match } from "./match.entity";
import { GameState } from '../utls/game';
import { Queue } from "./queue.entity";

@Entity({name: 'players'})
export class Player {
    @PrimaryColumn({unique: true})
    id: string

    @OneToOne(() => User)
    @JoinColumn()
    user: User

    @Column()
    clientId: string

    @Column({default: 0})
    score: number

    @ManyToMany(() => Match, (match) => match.players, { nullable: true})
    matches: Match[] | []

    @ManyToOne(() => Queue, (queue) => queue.players, {onDelete: 'SET NULL'})
    queue: Queue

    @Column({default: GameState.START})
    gameState: GameState
}
