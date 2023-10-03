export interface Channel {
  id: number
  name: string
  type: string
  // TODO: There should also be an image, but I'm not sure how to do it
}

// export interface User {
//   id: string
//   username: string
//   email: string
//   avatar: string
//   status: number
// }

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

export interface Message {
  name: string
  messageContent: string
  timestamp: number
  sessionUser: boolean
}

export interface Match {
  id: number
  userScore: number
  opponentScore: number
  opponentName: string
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
