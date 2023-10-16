import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "src/user/entities/user.entity";
import { Channel } from "./channel.entity";

@Entity()
export class JoinedChannel  {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    socketID: string;

    @ManyToOne(() => User, (user) => user.joinedChannels)
    @JoinColumn()
    user: User;

    @ManyToOne(() => Channel,  (channel) => channel.joinedUsers)
    @JoinColumn()
    channel: Channel
}