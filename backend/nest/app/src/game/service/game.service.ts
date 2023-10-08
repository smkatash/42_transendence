import { Injectable } from '@nestjs/common';
import { Ball, Game, GameMode, GameOptions, GameState, Paddle, Paddletype, Position } from '../utls/game';
import { DEFAULT_PADDLE_GAP, DEFAULT_PADDLE_LENGTH, DEFAULT_TABLE_HEIGHT, DEFAULT_TABLE_PROPORTION } from 'src/Constants';
import { Match } from '../entities/match.entity';

@Injectable()
export class GameService {
    static options = Object.freeze(new GameOptions(DEFAULT_TABLE_HEIGHT, DEFAULT_PADDLE_GAP, GameMode.EASY))
    private MAXPOINTS = 10

    constructor() {}

    public launchGame(match: Match): Game {
        const ball: Ball = this.launchBall()
        const leftPaddle: Paddle = this.launchPaddle(Paddletype.LEFT) 
        const rightPaddle: Paddle = this.launchPaddle(Paddletype.RIGHT)
        const scores: Record<string, number> = {}

        match.players.forEach((player) => {
          scores[player.id] = 0
        })

        return {
                ball: ball, 
                leftPaddle: leftPaddle, 
                rightPaddle: rightPaddle, 
                match: match, 
                status: GameState.INPROGRESS,
                scores: scores
            }
    }

    private resetGame(game: Game, winner: Paddletype): Game {
        game.scores[game.match.players[winner].id]++
        if (game.scores[game.match.players[winner].id] >= this.MAXPOINTS) { 
            game = this.endOfGame(game, winner)
        } else {
            game.ball = this.launchBall()
            game.leftPaddle = this.launchPaddle(Paddletype.LEFT) 
            game.rightPaddle = this.launchPaddle(Paddletype.RIGHT)
            game.status = GameState.INPROGRESS
        }
        return game
    }

    endOfGame(game: Game, winner: Paddletype) {
        const loser = winner === Paddletype.LEFT ? Paddletype.RIGHT : Paddletype.LEFT
        game.match.winner = game.match.players[winner]
        game.match.loser = game.match.players[loser]
        game.status = GameState.END

        return game
    }

    private calculateVector(): Position {
        const randomAngle = this.getRandomAngle()
        const radian = this.degreesToRadian(randomAngle)
        return { x: Math.cos(radian), y: Math.sin(radian) }
    }

    private getRandomAngle(): number {
        return Math.random() * 360
    }

    private degreesToRadian(degrees: number): number {
        return degrees * (Math.PI / 180)
    }

    private launchBall(): Ball {
        const dir: Position = this.calculateVector()
        const ball: Ball = {
            position: {
                x: GameService.options.table.width / DEFAULT_TABLE_PROPORTION,
                y: GameService.options.table.height / DEFAULT_TABLE_PROPORTION,
            },
            velocity: {
                x: dir.x,
                y: dir.y
            }
        }
        return ball
    }

    private launchPaddle(type: Paddletype): Paddle {
        let x: number
        
        if (type === Paddletype.LEFT) {
            x = GameService.options.paddleDistance
        } else {
            x = GameService.options.table.width - GameService.options.paddleDistance
        }

        const paddle: Paddle = {
            position: {
                x: x,
                y: GameService.options.table.height / 2,
            },
            length: DEFAULT_PADDLE_LENGTH,
        }

        return paddle
    }

    throwBall(game: Game): Game {
        game.ball.position.x += game.ball.velocity.x
        game.ball.position.y += game.ball.velocity.y

        if (game.ball.position.y >=  GameService.options.table.height - 5) {
            game.ball.velocity.y *= -1
            game.ball.position.y = GameService.options.table.height - 6
            return game
        } else if (game.ball.position.y < 5) {
            game.ball.velocity.y *= -1
            game.ball.position.y = 6
            return game
        }
        console.log('Throw2')
        // if (game.ball.position.x <= GameService.options.paddleDistance) {
        if (game.ball.position.x <= 15) {
            if (game.ball.position.y > (game.leftPaddle.position.y - (game.leftPaddle.length / 2)) &&
                    game.ball.position.y < (game.leftPaddle.position.y + (game.leftPaddle.length / 2))) {
                    game.ball.velocity.x *= -1
                    // game.ball.position.x = GameService.options.paddleDistance + 0.5
                    game.ball.position.x = 50 + 0.5
                    return game
             }
            console.log('Throw3')
            return this.resetGame(game, Paddletype.RIGHT)
        // } else if (game.ball.position.x > GameService.options.table.width - GameService.options.paddleDistance) {
        } else if (game.ball.position.x > GameService.options.table.width - 15) {
            if (game.ball.position.y > (game.rightPaddle.position.y - (game.rightPaddle.length / 2)) &&
                    game.ball.position.y < (game.rightPaddle.position.y + (game.rightPaddle.length / 2))) {
                    game.ball.velocity.x *= -1
                    // game.ball.position.x = GameService.options.table.width - GameService.options.paddleDistance - 0.5
                    game.ball.position.x = GameService.options.table.width - 50 - 0.5
                    return game
            }
            console.log('Throw4')
            return this.resetGame(game, Paddletype.LEFT)
        }
        return game
    }
}

// 1. random value -1 and 1 , to identify the start direction
// 2. random value between 0 and 90, cos and sin
/* 
    Degree
    if (v > 45) {
        v -=45
    } else {
        v = 320 + v
    }

    convert to radian
    dx = cos(radian)
    dy = sin (radian)


    position = position.x + x, position.y + y
    
    width="1024px" height="768px -> inital

*/
/* while loop, 
     x += dx
     y += dy

    if (x,y >== height) {
        dy *= -1
        x = x
        y = height - 0.5
    } else if (x,y <== 0) {
        dy *= -1
        x = x
        y = 0 + 0.5
    }

    if ( x <= 10 ) {
        if (y > leftPaddle.y - 10 && y < leftPaddle.y + 10) {
            dx *= - 1
            x = 10 + 0.5
            y = y
        } else {
            Score! Reset the position/game
        }
    } else if (x > width - 10) {
         if (y > rightPaddle.y - 10 && y < rightPaddle.y + 10) {
            dx *= - 1
            x = width - 10 - 0.5
            y = y
        } else {
            Score! Reset the position/game
        }
    }

    if (score => MAXSCORE) {
        STOP
    }


    leftPaddle = y = height / 2, x = 10
    rightPaddle = y height / 2, x = width - 10

*/