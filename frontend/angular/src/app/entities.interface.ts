export interface Channel {
  id: number
  name: string
  type: string
  // TODO: There should also be an image, but I'm not sure how to do it
}

export interface User {
  id: number
  login: string
  title: string
  status: string
  rank: number
  wins: number
  losses: number
  matchesPlayed: number
}

export interface UserFriend { // this might be deleted
  id: number
  friends: User[]
}

export interface ChannelUsers { // this might be deleted
  id: number
  users: User[]
}

export interface Message {
  name: string
  messageContent: string
  timestamp: number
  sessionUser: boolean
}

export interface ChannelMessages { // this might be deleted
  id: number
  messages: Message[]
}

export interface Match {
  id: number
  userScore: number
  opponentScore: number
  opponentName: string
}

export interface UserMatches {
  id: number //Stands for user id
  matches: Match[]
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