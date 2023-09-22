import { Socket } from 'socket.io';
import { User } from 'src/user/entities/user.entity';
import { Player } from '../entities/player.entity';
import { DEFAULT_PADDLE_GAP, DEFAULT_TABLE_PROPORTION } from 'src/Constants';
import { Match } from '../entities/match.entity';

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


export class GameOptions {
  mode: GameMode
  table: TableDimensions
  paddleDistance: number
  private readonly proportion = DEFAULT_TABLE_PROPORTION

  constructor(height: number, paddle: number, mode: GameMode) {
    this.mode = mode
    this.paddleDistance = paddle
    this.table = {
      height: height,
      width: this.proportion * height,
    }
  }
}

export enum PlayerType {
  OBSERVER = 0,
  GAMER
}

export interface MessageMatch {
  message: string
  matchId: string | undefined
  player: Player | undefined
}