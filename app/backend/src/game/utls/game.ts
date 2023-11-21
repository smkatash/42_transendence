import {  DEFAULT_TABLE_PROPORTION } from 'src/Constants';
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
  PAUSE,
  END
}

export enum GameMode {
  EASY = 1,
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
