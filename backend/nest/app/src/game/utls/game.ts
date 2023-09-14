import { Socket } from 'socket.io';
import { User } from 'src/user/entities/user.entity';

export interface Position {
    x: number
    y: number
  }

interface Ball {
    position: Position
    speed: number
}

export enum GameStatus {
  PAUSE = 0,
  WAITING,
  START,
  INPROGRESS,
  END
}

export interface Game {
  id: string
  status: GameStatus
  players: Array<Player>
  clients?: Array<Socket>
  ball: Ball
  speed: number
}

export interface Player {
  user: User
  client: Socket
}

export enum PlayerType {
  OBSERVER = 0,
  GAMER
}