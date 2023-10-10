import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "./channel.entity";

@Entity()
export class Message    {
    @PrimaryGeneratedColumn()
    msgId: number;

    @Column()
    sender: string;

    @Column()
    recipient: string;

    @Column()
    createdAt: Date;

    @ManyToOne(() => Channel, (channel) => channel.messages)
    channel: Channel;
}