import { Socket } from 'socket.io';
import { User } from 'src/user/entities/user.entity';
import { Player } from '../entities/player.entity';

export interface Position {
    x: number
    y: number
  }

interface Ball {
    position: Position
    speed: number
}

export enum GameState {
  PAUSE = 0,
  INQUEUE,
  READY,
  START,
  INPROGRESS,
  END
}

// export interface Game {
//   id: string
//   status: GameState
//   players: Array<Player>
//   clients?: Array<Socket>
//   ball: Ball
//   speed: number
// }

// export interface Player {
//   user: User
//   client: Socket
// }

export enum PlayerType {
  OBSERVER = 0,
  GAMER
}

export interface MessageMatch {
  message: string
  matchId: string | undefined
  player: Player | undefined
}