import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GameStatus, Player } from "../utls/game";

@Entity({name: 'game'})
export class Match {
    @PrimaryGeneratedColumn()
    id: string

    @Column({default: GameStatus.WAITING})
    status: GameStatus

    @Column({ type: 'text', array: true, nullable: true })
    players: string[]

    @Column({ type: 'text', array: true, nullable: true })
    observers: string[]
    
    @ManyToOne(() => User, { nullable: true })
    winner: User
    
    @ManyToOne(() => User, { nullable: true })
    looser: User

    @Column({ type: 'jsonb', nullable: true })
    scores: Record<string, number>;
}