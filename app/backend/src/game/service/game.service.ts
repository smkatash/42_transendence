import { Injectable } from "@nestjs/common";
import { BALL_RADIUS, DEFAULT_PADDLE_GAP, DEFAULT_PADDLE_LENGTH, DEFAULT_TABLE_HEIGHT, DEFAULT_TABLE_PROPORTION, MAXPOINTS } from "src/utils/Constants";
import { Match } from "../entities/match.entity";
import { Ball, Game, GameMode, GameOptions, GameState, Paddle, Paddletype, Position } from "../utls/game";

@Injectable()
export class GameService {
  private options: Readonly<GameOptions>;
  private increment: number;

  public launchGame(match: Match, mode: GameMode): Game {
    this.initMode(mode);
    this.options = Object.freeze(new GameOptions(DEFAULT_TABLE_HEIGHT, DEFAULT_PADDLE_GAP, mode));
    const ball: Ball = this.launchBall();
    const leftPaddle: Paddle = this.launchPaddle(Paddletype.LEFT);
    const rightPaddle: Paddle = this.launchPaddle(Paddletype.RIGHT);
    const scores: Record<string, number> = {};

    match.status = GameState.INPROGRESS;
    match.players.forEach(player => {
      scores[player.id] = 0;
    });

    return {
      ball: ball,
      leftPaddle: leftPaddle,
      rightPaddle: rightPaddle,
      match: match,
      status: GameState.INPROGRESS,
      scores: scores,
    };
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
    game.scores[game.match.players[winner].id]++;
    if (game.scores[game.match.players[winner].id] >= MAXPOINTS) {
      game = this.endOfGame(game, winner);
    } else {
      game.ball = this.launchBall();
      game.leftPaddle = this.launchPaddle(Paddletype.LEFT);
      game.rightPaddle = this.launchPaddle(Paddletype.RIGHT);
      game.status = GameState.INPROGRESS;
    }
    return game;
  }

  endOfGame(game: Game, winner: Paddletype) {
    const loser = winner === Paddletype.LEFT ? Paddletype.RIGHT : Paddletype.LEFT;
    game.match.winner = game.match.players[winner];
    game.match.loser = game.match.players[loser];
    game.match.status = GameState.END;
    game.status = GameState.END;
    return game;
  }

  private calculateVector(): Position {
    const randomAngle = this.getRandomAngle();
    const radian = this.degreesToRadian(randomAngle);
	let retValueX = Math.cos(radian);
	let retValueY = Math.sin(radian);
	if(retValueX > 0){
		retValueX = retValueX + this.increment;
	} else {
		retValueX = retValueX = retValueX - this.increment;
	}
	if(retValueY > 0){
		retValueY = retValueY + this.increment;
	} else {
		retValueY = retValueY = retValueY - this.increment;
	}
    return { x: retValueX, y: retValueY};
  }

  private getRandomAngle(): number {
    let randomNumber = Math.random() * 360;
    if (randomNumber <= 45 || randomNumber >= 360 - 45 || (randomNumber >= 180 - 45 && randomNumber <= 180 + 45)) {
      return randomNumber;
    }
    if (randomNumber <= 90 || randomNumber >= 270) {
      randomNumber = Math.random() * 360;
      if (randomNumber <= 180) {
        return 90 - 45;
      }
      return 270 + 45;
    }
    randomNumber = Math.random() * 360;
    if (randomNumber <= 180) {
      return 180 - 45;
    }
    return 180 + 45;
  }

  private degreesToRadian(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private launchBall(): Ball {
    const dir: Position = this.calculateVector();
    const ball: Ball = {
      position: {
        x: this.options.table.width / DEFAULT_TABLE_PROPORTION,
        y: this.options.table.height / DEFAULT_TABLE_PROPORTION,
      },
      velocity: {
        x: dir.x,
        y: dir.y,
      },
    };
    return ball;
  }

  private launchPaddle(type: Paddletype): Paddle {
    let x: number
    let y: number
    if (type === Paddletype.LEFT) {
        x = this.options.paddleDistance;
        y = DEFAULT_PADDLE_LENGTH
    } else {
        x = this.options.table.width - this.options.paddleDistance
        y = this.options.table.height - 2 * DEFAULT_PADDLE_LENGTH
    }
    const paddle: Paddle = {
        position: {
            x: x,
            y: y,
        },
        length: DEFAULT_PADDLE_LENGTH,
    }
    return paddle
}

  throwBall(game: Game): Game {
    game.ball.position.x += game.ball.velocity.x;
    game.ball.position.y += game.ball.velocity.y;
    if (game.ball.position.y >= this.options.table.height - BALL_RADIUS) {
      game.ball.velocity.y *= -1;
      game.ball.position.y = this.options.table.height - 0.5 - BALL_RADIUS;
      return game;
    } else if (game.ball.position.y < 0.5 + BALL_RADIUS) {
      game.ball.velocity.y *= -1;
      game.ball.position.y = 0.6 + BALL_RADIUS;
      return game;
    }
      if ((game.ball.position.x - BALL_RADIUS <= this.options.paddleDistance + 3 + 1) && 
          (game.ball.position.x - BALL_RADIUS) >= this.options.paddleDistance - 3) {
        if (game.ball.position.y + BALL_RADIUS >= game.leftPaddle.position.y && 
           ((game.ball.position.y - BALL_RADIUS) <= game.leftPaddle.position.y + game.leftPaddle.length)) {
          game.ball.velocity.x *= -1;
          game.ball.position.x = this.options.paddleDistance + 6 + BALL_RADIUS;
          return game;
        }
      } else if (
        game.ball.position.x + BALL_RADIUS >= this.options.table.width - this.options.paddleDistance - 3 &&
        game.ball.position.x + BALL_RADIUS <= this.options.table.width - this.options.paddleDistance + 3
      ) {
        if (game.ball.position.y - BALL_RADIUS < game.rightPaddle.position.y + game.rightPaddle.length &&
            game.ball.position.y + BALL_RADIUS > game.rightPaddle.position.y) {
          game.ball.velocity.x *= -1;
          game.ball.position.x = this.options.table.width - this.options.paddleDistance - 6 - BALL_RADIUS;
          return game;
        }
      }
    if (game.ball.position.x <= 0 || game.ball.position.x >= DEFAULT_TABLE_HEIGHT * DEFAULT_TABLE_PROPORTION) {
    	if (game.ball.position.x <= DEFAULT_TABLE_HEIGHT) {
          return this.resetGame(game, Paddletype.RIGHT);
        }
        return this.resetGame(game, Paddletype.LEFT);
    }
    return game;
  }
}
