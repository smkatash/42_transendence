import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn} from "typeorm";
import { Status } from "../utils/status.enum";
import { Channel } from "src/chat/entities/channel.entity";
import { MfaStatus } from "src/auth/utils/mfa-status";
import { Message } from "src/chat/entities/message.entity";
import { JoinedChannel } from "src/chat/entities/joinedChannel.entity";


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

    @ManyToMany(() => User, (user) => user.blockedUsers)
	@JoinTable()
	blockedUsers: User[];

    /**
     * kello
     */
    @ManyToMany(() => Channel, channel => channel.users)
    channels: Channel[];

    @ManyToMany(() => Channel, channel => channel.admins, {nullable:true})
    adminAt: Channel[]

    @ManyToMany(() => Channel, (channel) => channel.banned, {nullable:true})
    bannedAt: Channel[]


    @OneToMany(() => Channel, (channel) => channel.owner, {nullable:true})
    ownedChannels: Channel[]

    @OneToMany(()=> Message, (message) => message.user)
    messages: Message[]

    @OneToMany(() => JoinedChannel, (joinedChannel) => joinedChannel.user)
    joinedChannels: JoinedChannel[]

    @ManyToMany(() => Channel, (channel) => channel.invitedUsers)
    invitedTo: Channel[]
}
	
