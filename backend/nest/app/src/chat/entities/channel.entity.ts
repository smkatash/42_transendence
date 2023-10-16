import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Message } from "./message.entity";
import { JoinedChannel } from "./joinedChannel.entity";

@Entity()
export class Channel    {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({unique: true})
    name: string;

    @Column()
    private: boolean;

    @ManyToOne(()=> User, (owner)=> owner.channels, {nullable: true})
    owner: User;

    @Column({nullable: true})
    hash: string;

    @Column({nullable: true})
    topic: string;

    @ManyToMany(() => User)
    @JoinTable()
    users: User[];

    @ManyToMany(() => User, {nullable: true})
    @JoinTable()
    admins: User[];

    @OneToMany(() => Message, (message) => message.channel)
    messages: Message[];

    @Column({default: false})
    protected: boolean;

    @OneToMany(() => JoinedChannel, (joinedChannel) => joinedChannel.channel)
    joinedUsers: JoinedChannel[]
    // @ManyToMany(()=> User)
    // @JoinTable()
    // invited: User[]



}