import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ChatUser   {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    socketId: string;

    @OneToOne(() => User)
    @JoinColumn()
    user: User;
}