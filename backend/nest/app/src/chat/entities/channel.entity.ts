import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Message } from "./message.entity";

@Entity()
export class Channel    {
    @PrimaryGeneratedColumn()
    chatId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({unique: true})
    name: string;

    @Column()
    private: boolean;

    @ManyToOne(()=> User, (owner)=> owner.channels)
    owner: User;

    @Column()
    hash: string;

    @Column({nullable: true})
    topic: string;

    @ManyToMany(() => User)
    @JoinTable()
    users: User[];

    @ManyToMany(() => User)
    @JoinTable()
    admins: User[]

    @OneToMany(() => Message, (message) => message.channel)
    messages: Message[]

}