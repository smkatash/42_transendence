import { Column, Entity, JoinTable, ManyToMany, PrimaryColumn} from "typeorm";
import { Status } from "../utils/status.dto";


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
}
