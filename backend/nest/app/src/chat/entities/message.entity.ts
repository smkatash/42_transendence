import { Column, Entity, JoinColumn, JoinTable, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "./channel.entity";
import { User } from "src/user/entities/user.entity";

@Entity()
export class Message    {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    // @Column()
    // sender: string;

    @ManyToOne(() => User, (user) => user.messages)
    @JoinColumn()
    user: User;

    @Column()
    recipient: string;

    @Column()
    createdAt: Date;

    @ManyToOne(() => Channel, (channel) => channel.messages)
    @JoinTable()
    channel: Channel;
}