export const CREATE = 'create'
/**
 * expects: CreateChannelDto
 * Creates a channel
 * on success emits:
 *  CHANNELS, USER_CHANNELS
 */

export const DELETE = 'delete'
/**
 * expects: cIdDto
 * Deletes a channel and everything related to it, only owner should be able to do it
 * on success emits:
 *  CHANNELS, USER_CHANNELS
 */

export const JOIN = 'join'
/**
 * expects: JoinChannelDto
 * Session user joins a channel. If protected, I need to give a password as well
 * on success emits:
 *  USER_CHANNELS
 * //TODO maybe also CHANNEL_USERS to channel users, if thesre's time
 */

export const USER_CHANNELS = 'userChannels'
/**
 * Gets the channels and DMs that the session user is in
 * on success emits:
 *      USER_CHANNELS, ChannelToFeDto[]
 */
export const CHANNEL_USERS = 'channelUsers'
/**
 * expects: cidDto
 * on success emits:
 *      CHANNEL_USERS, USER[]
 */

export const CHANNELS = 'channels'
/**
 *  Gets all existing channels, except private ones 
 *  on success emits:
 *      CHANNELS, ChannelToFeDto[]
 */

export const CHANNEL_MESSAGES = 'messages'
/**
 *  expects: cIdDto
 *  Gets all the messages inside channel
 *  on success emits:
 *      CHANNEL_MESSAGES, Message[]
 */

export const LEAVE = 'leave'
/**
 *  expects: cIdDto
 *  Session user leaves channel
 *  on success emits:
 *      USER_CHANNELS, ChannelToFeDto[]
 * //TODO maybe users to all channel users
 */

export const ADD_ADMIN = 'admin+'
// Session user makes another user admin
export const REM_ADMIN = 'admin-'
// Session user removes user from admins array
/**
 * expects: UpdateChannelDto
 * on success emits:
 *  ?SUCCESS?
 * 
 * 
*/

export const BAN = 'ban'
export const UNBAN = 'unban'
export const KICK = 'kick'
export const MUTE = 'mute'
export const UNMUTE = 'unmute' //there's no unmute
/**
 *  Session user KICKs (UN)BANs (UN)MUTEs user from (talking while muted in) channel,
 */
/**
 * expects: UpdateChannelDto
 * on success emits:
 *  - ?SUCCESS? CHANNEL?
 *  - KICK BAN: CHANNEL_USERS,  //TODO maybe users to all channel users 
 * 
*/

export const DIRECT = 'privMsg'
/**
 * Send direct message to user. Creates a channel between the two users
 * expects: PrivMsgDto
 * on success emits: 
 *  //TODO USER_CHANNLES for both
 *  - broadcasts the message: MESSAGE, Message
 * 
 */
// 

export const CHANNEL = 'channel'
// Doesn't do shit for me
// 'getChannel', { cIdDto }
/**
 * expects: cIdDto
 * emits:
 *  CHANNEL, Channel
 */

export const MESSAGE = 'newMsg'
/**
 * Sending a message to a channel
 *  expects: CreateMessageDto 
 * 
 */

export const PASSWORD = 'password'
/**
 * Use when you want to change, add or remove a password.
 * Usage: If there is no password already, I fill in newPass to make channel protected.
 * If there is a password already, I fill in newPass to change the password.
 * Or I can send the oldPass only to remove password protection 
 * 
 * expects: ChannelPasswordDto
 */


export const INVITE_TO_PRIVATE = 'inviteToPriv'
/**
 * Session user invites user to channel
 * //TODO the flow stil in dev
 * expects: UpdateChannelDto
 */


export const DECLINE_PRIVATE_INVITE = 'declineToPriv'
/**
 * Session user declines invitation to private channel
 * //TODO the flow stil in dev
 * expects: cIdDto
 */

export const BLOCK = 'block'
export const UNBLOCK = 'unblock'
/**
 * expects: uIdDto
 * disables(enables back) communication between users
 * emits:
 *  not defined yet
 */


/*
    **  events:
*/

export const ERROR = 'error'
/**
 * emitted on error, or no rights
 * 
 * emits:
 *  ERROR, error: any
 */

export const SUCCESS = 'success'
/**
 * Backend emits success
 * emits:
 *  'success', (to be determined)
 */
 
/*

// Backend emits all channels the session user is in
'usersChannels', Channel[] -> ChannelToFeDto[]

// Backend emits all channels available except private ones
'allChannels', Channel[] -> ChannelToFeDto[]

// Incoming messages. Need to compare with current channelid to see if I need to display or not
'incMsg', { Message }

// Fetch channel messages. Should always be subscribed to. Changes when we emit different getChannelMessages to socket
'channelMessages', Message[]
*/