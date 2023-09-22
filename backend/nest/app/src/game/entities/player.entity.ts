import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { Socket } from "socket.io";
import { Match } from "./match.entity";
import { Queue } from "./queue.entity";

@Entity({name: 'player'})
export class Player {
    @PrimaryColumn({unique: true})
    id: string

    @OneToOne(() => User)
    @JoinColumn()
    user: User

    @Column()
    clientId: string

    @ManyToMany(() => Match, (match) => match.players, { nullable: true})
    matches: Match[] | []

    @ManyToOne(() => Queue, { nullable: true })
    queue: Queue
}