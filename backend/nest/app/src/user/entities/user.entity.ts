import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn} from "typeorm";
import { Status } from "../utils/status.dto";
import { Channel } from "src/chat/entities/channel.entity";


@Entity({name: 'users'})
export class User {
    @PrimaryColumn({unique: true})
    id: string
    
    @Column({unique: true})
    username: string
    
    @Column()
    email: string
    
    @Column()
    avatar: string

    @Column({ default: Status.OFFLINE})
    status: Status

    @ManyToMany(() => User, (user) => user.friends)
    @JoinTable()
    friendOf: User[]

    @ManyToMany(() => User, (user) => user.friendOf)
    friends: User[]

    @ManyToMany(() => Channel, channel => channel.users)
    @JoinTable()
    channels: Channel[];

    @OneToMany(() => Channel, (channel) => channel.owner)
    ownedChannels: Channel[]
}
