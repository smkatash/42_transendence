import { Injectable } from "@nestjs/common";
import { GameMode } from "../utls/game";

@Injectable()
export class PlayerQueueService {
	private MIN_NUMBER = 2
	private queues: Record<GameMode, string[]> = {
		[GameMode.EASY]: [],
		[GameMode.MEDIUM]: [],
		[GameMode.HARD]: [],
	
	}

	enqueue(playerId: string, mode: GameMode): void {
	  if (!this.queues[mode]) {
		this.queues[mode] = [];
	  }
	  this.queues[mode].push(playerId);
	}

	dequeue(mode: GameMode): string[] {
		const playersId = this.queues[mode]
		if (playersId.length < this.MIN_NUMBER) {
		  return []
		}
	
		const shuffledIds = playersId.slice().sort(() => Math.random() - 0.5)
		const selectedIds = shuffledIds.slice(0, this.MIN_NUMBER);
		this.queues[mode] = this.queues[mode].filter((id) => !selectedIds.includes(id));
	
		return selectedIds;
	}

	isQueueReady(mode: GameMode): boolean {
		return this.queues[mode].length >= this.MIN_NUMBER
	}

	isInQueue(playerId: string, mode: GameMode) {
		return this.queues[mode].includes(playerId)
	}
}