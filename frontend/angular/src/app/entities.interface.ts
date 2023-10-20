export interface Channel {
  id?: number
  name?: string
  type?: string
  private?: boolean
  // avatar: string
  // owner?: string
  owner?: User
  users?: User[]
  admins?: User[]
  protected?: boolean
  topic?: string
}

export interface User {
  id: string
  username: string
  title: string
  avatar: string
  email: string
  status: number
  mfaEnable: boolean
  mfaStatus: number
}

export interface Stats {
  wins: number
  losses: number
}

// export interface User {
//   id: number
//   login: string
//   title: string
//   status: string
//   rank: number
//   wins: number
//   losses: number
//   matchesPlayed: number
// }

export interface Message {
  name?: string
  messageContent?: string
  timestamp?: number
  sessionUser?: boolean
  id?: number;
  content: string;
  user?: User;
  channel?: Channel;
  createdAt?: Date
  channelId: number
}

export interface Match {
  matchResult: string
  currentUserScore: number
  opponentUser: User
  opponentUserScore: number
}

// export interface Match {
//   id: string
//   loser: User
//   scores: Record<string, number>
// }


// leaderboard interface shit --------------------------------

export interface Player{
  id: number
  clientId :string
  score: number
  gameState: number
}


// -----------------------------------------------------------

export interface Document {
  id: string
  doc: string
}

// leaderboard interface shit --------------------------------

export interface Player{
  id: number
  clientId :string
  score: number
  gameState: number
}


// -----------------------------------------------------------

export interface Document {
  id: string
  doc: string
}

export  interface JoinChannelInfo {
  id: number,
  password?: string
}
