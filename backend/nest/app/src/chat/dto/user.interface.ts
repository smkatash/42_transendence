import { Status } from "src/user/utils/status.dto"
import { MfaStatus } from "src/auth/utils/mfa-status"
import { ChannelInterface } from "./channel.interface"

export interface UserInterface {
    id: string
    username: string
    title?: string
    avatar?: string
    email?: string
	mfaEnabled?: boolean
	mfaStatus?: MfaStatus
    status?: Status
    friendOf: UserInterface[]
    friends: UserInterface[]
    channels?: ChannelInterface[];
    ownedChannels?: ChannelInterface[]
	sentFriendRequests?: UserInterface[]
	pendingFriendRequests?: UserInterface[]
}
