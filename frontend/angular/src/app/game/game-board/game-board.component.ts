import { Component,HostListener } from '@angular/core';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.css']
})
export class GameBoardComponent {
    // const
    ballWidth = 3;
    ballHeight = 4;
    racketWidth = 3;
    racketHeight = 20;
    racketMargin = 3;
    racketSpeed = 1;
  
    score0 = 0;
    score1 = 0;
    racket0Y = 40;
    racket1Y = 40;
    racket0X = this.racketMargin;
    racket1X = 100 - this.racketMargin - this.racketWidth;
    ballX = -1 * this.ballWidth;
    ballY = -1 * this.ballHeight;
    canMoveBall = false;
    canMoveRackets = false;
    racket0Increment = 0;
    racket1Increment = 0;
  
    @HostListener('window:keydown', ['$event'])
    onKeyDown(e: any) {
      if (e.code === 'KeyW') {
        this.racket0Increment = -this.racketSpeed;
      }
      if (e.code === 'KeyS') {
        this.racket0Increment = this.racketSpeed;
      }
      if (e.code === 'ArrowUp') {
        this.racket1Increment = -this.racketSpeed;
      }
      if (e.code === 'ArrowDown') {
        this.racket1Increment = this.racketSpeed;
      }
    }
  
    @HostListener('window:keyup', ['$event'])
    onKeyUp(e: any) {
      if (e.code === 'KeyW' || e.code === 'KeyS') {
        this.racket0Increment = 0;
      }
      if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
        this.racket1Increment = 0;
      }
    }
  
    resetAll(): void {
      this.score0 = 0;
      this.score1 = 0;
      this.resetBallAndRackets();
    }
  
    resetBallAndRackets(): void {
      this.racket0Y = 40;
      this.racket1Y = 40;
      this.ballX = -1 * this.ballWidth;
      this.ballY = -1 * this.ballHeight;
      this.canMoveBall = false;
    }

    newGame(): void {
      this.resetAll();
      this.startRound();
    }
  
    startRound(): void {
      this.setBall();
      const xIncrement = this.getRandomIncrement();
      const yIncrement = this.getRandomIncrement();
      this.canMoveBall = true;
      this.canMoveRackets = true;
      window.requestAnimationFrame(() => this.moveRacket0(this.racket0Increment));
      window.requestAnimationFrame(() => this.moveRacket1(this.racket1Increment));
      window.requestAnimationFrame(() => this.moveBall(xIncrement, yIncrement));
    }
  
     getRandomIncrement(): number {
      const randomValue = Math.random() * (0.6 + 0.6) - 0.6; // (max - min ) - min
      return parseFloat(randomValue.toFixed(1));
    }
  
    setBall(): void {
      this.ballX = 48.5;
      this.ballY = Math.floor(Math.random() * (100 - this.ballHeight + 1));
    }
  
    async moveBall(xIncrement: number, yIncrement: number): Promise<void> {
      if (!this.canMoveBall) {
        return;
      }
      this.ballX += xIncrement;
      this.ballY += yIncrement;
  
      if (this.isBallCollidedWithWalls()) {
        yIncrement *= -1;
      }
  
      if (this.isBallCollidedWithRacket0()) {
        xIncrement *= -1;
      } else if (this.isBallCollidedWithRacket1()) {
        xIncrement *= -1;
      }
  
      if (this.isPlayer0Scored()) {
        this.score0++;
        if (!this.isPlayer0Win() && !this.isPlayer1Win()) {
          await this.delay(1000);
          this.startRound();
        }
        return;
      } else if (this.isPlayer1Scored()) {
        this.score1++;
        if (!this.isPlayer0Win() && !this.isPlayer1Win()) {
          await this.delay(1000);
          this.startRound();
        }
        return;
      }
      window.requestAnimationFrame(() => this.moveBall(xIncrement, yIncrement));
    }
  
    moveRacket0(yIncrement: number): void {
      if (!this.canMoveRackets) {
        return;
      }
      let newY = this.racket0Y + yIncrement;
      newY = Math.min(newY, 100 - this.racketHeight);
      newY = Math.max(newY, 0);
      this.racket0Y = newY;
      window.requestAnimationFrame(() => this.moveRacket0(this.racket0Increment));
    }
  
    moveRacket1(yIncrement: number): void {
      if (!this.canMoveRackets) {
        return;
      }
      let newY = this.racket1Y + yIncrement;
      newY = Math.min(newY, 100 - this.racketHeight);
      newY = Math.max(newY, 0);
      this.racket1Y = newY;
      window.requestAnimationFrame(() => this.moveRacket1(this.racket1Increment));
    }
  
    applyCollisionWithRackets(xIncrement: number): number {
      if (
        this.ballX <= this.racketMargin + this.racketWidth ||
        this.ballX + this.ballWidth >= 100 - this.racketMargin - this.racketWidth
      ) {
        return -1 * xIncrement;
      } else {
        return xIncrement;
      }
    }
  
    isBallCollidedWithRacket0(): boolean {
      const racket0RightX = this.racket0X + this.racketWidth;
      const ballCenterY = this.ballY + this.ballHeight / 2;
      return (
        this.ballX <= racket0RightX &&
        this.ballX > this.racket0X &&
        ballCenterY >= this.racket0Y &&
        ballCenterY <= this.racket0Y + this.racketHeight
      );
    }
  
    isBallCollidedWithRacket1(): boolean {
      const ballRightX = this.ballX + this.ballWidth;
      const racket1RightX = this.racket1X + this.racketWidth;
      const ballCenterY = this.ballY + this.ballHeight / 2;
      return (
        ballRightX >= this.racket1X &&
        ballRightX < racket1RightX &&
        ballCenterY >= this.racket1Y &&
        ballCenterY <= this.racket1Y + this.racketHeight
      );
    }
  
    isBallCollidedWithWalls(): boolean {
      return this.ballY <= 0 || this.ballY + this.ballHeight >= 100;
    }
  
    isPlayer0Scored(): boolean {
      return this.ballX >= 100;
    }
  
    isPlayer1Scored(): boolean {
      return this.ballX + this.ballWidth <= 0;
    }
  
    isPlayer0Win(): boolean {
      return this.score0 === 10;
    }
  
    isPlayer1Win(): boolean {
      return this.score1 === 10;
    }
  
    delay(ms: number): Promise<void> {
      return new Promise((f) => setTimeout(f, ms));
    }
}
