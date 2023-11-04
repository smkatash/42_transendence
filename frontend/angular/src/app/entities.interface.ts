export interface Channel {
  id: number
  name?: string
  type: string
  protected: boolean
  private: boolean
  avatar?: string
  updatedAt: Date
  owner?: User
  users: User[]
  admins?: User[]
}

export interface JoinChannelInfo {
  id: number,
  password?: string
}

export interface CreateChannelInfo {
  name: string
  type: string
  private: boolean
  password?: string
}

export interface UserProfile {
  user: User
  friends: User[]
  receivedRequests: User[] // Not used if not current user
  sentRequests: User[] // Not used if not current user
  matches: Match[]
  rank: number
  stats: Stats
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

export interface ChannelUsers {
  users: User[]
  cId: number
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
  id: number
  user: User
  content: string
  channel: Channel
  createdAt: Date
  sessionUser: boolean
  inviteType?: string
  inviteID?: string | number
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


// game interface --------------------------------

export interface Player {
  id: number
  clientId :string
  score: number
  gameState: number
  user?: User
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
ball?: Ball
leftPaddle?: Paddle
rightPaddle?: Paddle
match?: Match
status?: GameState
scores?: Record<string, number>
}

export interface Match {
  id: string;
  status : GameState;
  players: GamePlayer[];
  winner: GamePlayer;
  loser: GamePlayer;
  scores: Record <string,number>;
}

export enum GameState {
  READY = 0,
  START,
  INPROGRESS,
  PAUSE,
  END
}

export enum GameMode {
  EASY = 1,
  MEDIUM,
  HARD
}

export class JoinMatchDto {
  matchId?: string
  mode?: GameMode
}

export class GameModeDto {
  mode: GameMode;
}

export class PositionDto {
    step: string
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
