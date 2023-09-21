import { Injectable } from '@nestjs/common';
import { Ball, Game, GameMode, GameOptions, Paddle, Paddletype, Position } from '../utls/game';
import { DEFAULT_PADDLE_GAP, DEFAULT_PADDLE_LENGTH, DEFAULT_TABLE_HEIGHT, DEFAULT_TABLE_PROPORTION } from 'src/Constants';


@Injectable()
export class GameService {
    static options = Object.freeze(new GameOptions(DEFAULT_TABLE_HEIGHT, DEFAULT_PADDLE_GAP, GameMode.EASY))
    
    constructor() {}

    public launchGame(): Game {
        const ball: Ball = this.launchBall()
        const leftPaddle: Paddle = this.launchPaddle(Paddletype.LEFT) 
        const rightPaddle: Paddle = this.launchPaddle(Paddletype.RIGHT) 
        return {ball, leftPaddle, rightPaddle}
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
                x: GameService.options.table.height / DEFAULT_TABLE_PROPORTION,
                y: GameService.options.table.width / DEFAULT_TABLE_PROPORTION,
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

    @Interval(1000 / 60)
    async throwBall(game: Game) {
        game.ball.position.x += game.ball.velocity.x
        game.ball.position.y += game.ball.velocity.y

        if (game.ball.position.y >=  GameService.options.table.height) {
            game.ball.velocity.y *= -1
            game.ball.position.y = GameService.options.table.height - 0.5
            // emit
        } else if (game.ball.position.y < 0) {
            game.ball.velocity.y *= -1
            game.ball.position.y = 0.5
            //emit
        }

        if (game.ball.position.x <= GameService.options.paddleDistance) {
            if (game.ball.position.y > (game.leftPaddle.position.y - GameService.options.paddleDistance) &&
                    game.ball.position.y < (game.leftPaddle.position.y + GameService.options.paddleDistance)) {
                    game.ball.velocity.x *= -1
                    game.ball.position.x = GameService.options.paddleDistance + 0.5
                // emit
             } else {
                // reset
             }

        } else if (game.ball.position.x > GameService.options.table.width - GameService.options.paddleDistance) {
            if (game.ball.position.y > (game.rightPaddle.position.y - GameService.options.paddleDistance) &&
                    game.ball.position.y < (game.rightPaddle.position.y + GameService.options.paddleDistance)) {
                    game.ball.velocity.x *= -1
                    game.ball.position.x = GameService.options.table.width - GameService.options.paddleDistance - 0.5
            } else {
                // reset
            }
        }
        //emit
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