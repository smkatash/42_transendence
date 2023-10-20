export interface Channel {
  id: number
  name: string
  type: string
  avatar: string
}

export interface User {
  id: string
  username: string
  title: string
  avatar: string
  status: number
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
  name: string
  messageContent: string
  timestamp: number
  sessionUser: boolean
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

// ============================================================

export interface GamePlayer {
  id: string;
  clientId: string;
  score: number;
  gameState: number;
  queue: any;
}

export interface SocketResponse {
  id: string;
  status: number;
  players: GamePlayer[];
  scores: any;
}

export interface Position {
  x: number
  y: number
}

export interface Ball {
position: Position
velocity: Position
}

export interface Game {
ball: Ball
leftPaddle: Paddle
rightPaddle: Paddle
match: Match
status: GameState
scores?: Record<string, number>
}

export interface Match {
  id: string;
  status : GameState;
  players: GamePlayer[];
  observers: GamePlayer[];
  winner: GamePlayer[];
  loser: GamePlayer[];
  scores: Record <string,number>;
}

export enum GameState {
  READY = 0,
  START,
  INPROGRESS,
  END
}

export enum GameMode {
  EASY = 0,
  MEDIUM,
  HARD
}

export class JoinMatchDto {
  matchId?: string
  mode?: GameMode
}

export interface TableDimensions {
  height: number
  width: number
}

export interface Paddle {
  position: Position,
  length: number
}

export enum Paddletype {
  LEFT = 0,
  RIGHT
}

export interface MessageMatch {
  message: string
  matchId: string | undefined
  player: Player | undefined
}

export enum PlayerType {
  OBSERVER = 0,
  GAMER
}