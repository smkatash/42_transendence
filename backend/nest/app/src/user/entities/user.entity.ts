import { Column, Entity, JoinTable, ManyToMany, PrimaryColumn} from "typeorm";
import { Status } from "../utils/status.dto";
import { MfaStatus } from "src/auth/utils/mfa-status";


@Entity({name: 'users'})
export class User {
    @PrimaryColumn({unique: true})
    id: string
    
    @Column({unique: true})
    username: string
    
    @Column()
    title: string
    
    @Column()
    avatar: string

	@Column({nullable: true})
    email: string

	@Column({default: false})
	mfaEnabled: boolean

	@Column({default: MfaStatus.DENY})
	mfaStatus: MfaStatus

    @Column({ default: Status.OFFLINE})
    status: Status

    @ManyToMany(() => User, (user) => user.friends)
    @JoinTable()
    friendOf: User[]

    @ManyToMany(() => User, (user) => user.friendOf)
    friends: User[]

	@ManyToMany(() => User, (user) => user.pendingFriendRequests)
	@JoinTable()
	sentFriendRequests: User[]

	@ManyToMany(() => User, (user) => user.sentFriendRequests)
	pendingFriendRequests: User[]
}
