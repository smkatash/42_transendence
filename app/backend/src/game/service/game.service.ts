import { Injectable } from '@nestjs/common';
import { Ball, Game, GameMode, GameOptions, GameState, Paddle, Paddletype, Position } from '../utls/game';
import { DEFAULT_PADDLE_GAP, DEFAULT_PADDLE_LENGTH, DEFAULT_PADDLE_WIDTH, DEFAULT_TABLE_HEIGHT, DEFAULT_TABLE_PROPORTION, BALL_RADIUS, MAXPOINTS } from 'src/Constants';
import { Match } from '../entities/match.entity';

@Injectable()
export class GameService {
    private options: Readonly<GameOptions>
    private increment: number
    private hookeyMode: boolean = false;
    private tmpIncrement: number = 0;

    constructor() {}

    public launchGame(match: Match, mode: GameMode): Game {
		this.initMode(mode)
        this.tmpIncrement = 0;
		this.options = Object.freeze(new GameOptions(DEFAULT_TABLE_HEIGHT, DEFAULT_PADDLE_GAP, mode))
        const ball: Ball = this.launchBall()
        const leftPaddle: Paddle = this.launchPaddle(Paddletype.LEFT) 
        const rightPaddle: Paddle = this.launchPaddle(Paddletype.RIGHT)
        const scores: Record<string, number> = {}
        
        match.status = GameState.INPROGRESS
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

	private initMode(mode: GameMode) {
		const modeMap = {
			[GameMode.EASY]: 2,
			[GameMode.MEDIUM]: 4,
			[GameMode.HARD]: 6,
		  };
		
		this.increment = modeMap[mode] || 2;
	}

    private resetGame(game: Game, winner: Paddletype): Game {
        game.scores[game.match.players[winner].id]++
        if (game.scores[game.match.players[winner].id] >= MAXPOINTS) { 
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
        game.match.status = GameState.END
        game.status = GameState.END
        return game
    }

    private calculateVector(): Position {
        const randomAngle = this.getRandomAngle()
        const radian = this.degreesToRadian(randomAngle)
        return { x: Math.cos(radian) + this.increment + this.tmpIncrement, y: Math.sin(radian) + this.increment + this.tmpIncrement}
    }

    private getRandomAngle(): number {
        let randomNumber = Math.random() * 360;
        if( (randomNumber <= 45 || randomNumber >= (360 - 45)) ||
            (randomNumber >= 180 - 45 && randomNumber <= (180 + 45)) ){
            return (randomNumber);
        } else {
            if(randomNumber <= 90 || randomNumber >= 270){
                randomNumber = Math.random() * 360;
                if(randomNumber <= 180){
                    return(90 - 45);
                } 
                return ( 270 + 45);
            } else {
                randomNumber = Math.random() * 360;
                if(randomNumber <= 180){
                    return(180 - 45);
                }
                return ( 180 + 45);
            }   
        }
    }

    private degreesToRadian(degrees: number): number {
        return degrees * (Math.PI / 180)
    }

    private launchBall(): Ball {
        const dir: Position = this.calculateVector() 
        const ball: Ball = {
            position: {
                x: this.options.table.width / DEFAULT_TABLE_PROPORTION,
                y: this.options.table.height / DEFAULT_TABLE_PROPORTION,
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
            x = this.options.paddleDistance
        } else {
            x = this.options.table.width - this.options.paddleDistance
        }

        const paddle: Paddle = {
            position: {
                x: x,
                y: this.options.table.height / DEFAULT_TABLE_PROPORTION,
            },
            length: DEFAULT_PADDLE_LENGTH,
        }

        return paddle
    }

    throwBall(game: Game): Game {
        game.ball.position.x += game.ball.velocity.x
        game.ball.position.y += game.ball.velocity.y
        if (game.ball.position.y >=  this.options.table.height - BALL_RADIUS) {
            game.ball.velocity.y *= -1
            game.ball.position.y = this.options.table.height - 0.5 - BALL_RADIUS
            return game
        } else if (game.ball.position.y < 0.5 + BALL_RADIUS) {
            game.ball.velocity.y *= -1
            game.ball.position.y = 0.6 + BALL_RADIUS
            return game
        }
        if(this.hookeyMode === false){
            if (game.ball.position.x - BALL_RADIUS <= this.options.paddleDistance + 2 && 
                game.ball.position.x - BALL_RADIUS >= this.options.paddleDistance -2) {
                if (game.ball.position.y - BALL_RADIUS< (game.leftPaddle.position.y + (game.leftPaddle.length)) &&
                     game.ball.position.y + BALL_RADIUS > (game.leftPaddle.position.y)) {
                    this.tmpIncrement = this.increment -2;
                    game.ball.velocity.x *= -1
                    // game = this.calculatePaddleBounce(game, game.leftPaddle, game.ball);
                    game.ball.position.x = this.options.paddleDistance + 2 + BALL_RADIUS
                    const offset = (game.ball.position.y + (BALL_RADIUS * 2) - game.leftPaddle.position.y + (DEFAULT_PADDLE_LENGTH/2)) / ( DEFAULT_PADDLE_LENGTH + (BALL_RADIUS * 2));
                    const tetha = 0.25 * Math.PI * ((2 * offset) - 1) 
                    game.ball.velocity.y = game.ball.velocity.y * Math.sin(tetha);
                    return game
                }
                // return this.resetGame(game, Paddletype.RIGHT)
            } else if (game.ball.position.x + BALL_RADIUS >= this.options.table.width - this.options.paddleDistance - 2 &&
                       game.ball.position.x + BALL_RADIUS <= this.options.table.width - this.options.paddleDistance + 2) {
                if (game.ball.position.y < (game.rightPaddle.position.y + (game.rightPaddle.length)) &&
                        game.ball.position.y > (game.rightPaddle.position.y)) {
                    this.tmpIncrement = this.increment -2;
                    game.ball.velocity.x *= -1
                    // game = this.calculatePaddleBounce(game, game.leftPaddle, game.ball);
                    game.ball.position.x = this.options.table.width - this.options.paddleDistance - 2 -BALL_RADIUS;
                    return game
                }
                // return this.resetGame(game, Paddletype.LEFT)
            }
            if(game.ball.position.x <= BALL_RADIUS || game.ball.position.x >= DEFAULT_TABLE_HEIGHT * DEFAULT_TABLE_PROPORTION - BALL_RADIUS){
                if(game.ball.position.x <= DEFAULT_TABLE_PROPORTION){
                    return this.resetGame(game, Paddletype.RIGHT)
                } else {
                    return this.resetGame(game, Paddletype.LEFT)
                }
            }
        }
        return game
    }
}
