import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Message    {
    @PrimaryGeneratedColumn()
    msgId: number;

    @Column()
    sender: string;

    @Column()
    recipient: string;

    // @Column()
    // createdAt: 
}