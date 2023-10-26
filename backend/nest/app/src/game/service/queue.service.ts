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
	private playersMatchQueue: Record<string, string[]> = {}

	enqueue(playerId: string, mode: GameMode): void {
	  if (!this.queues[mode]) {
		this.queues[mode] = [];
	  }
	  this.queues[mode].push(playerId);
	}

	dequeue(mode: GameMode): string[] {
		let selectedIds = []
		const playersId = this.queues[mode]
		if (playersId.length < this.MIN_NUMBER) {
		  return selectedIds
		}
	
		const shuffledIds = playersId.slice().sort(() => Math.random() - 0.5)
		selectedIds = shuffledIds.slice(0, this.MIN_NUMBER);
		this.queues[mode] = this.queues[mode].filter((id) => !selectedIds.includes(id));
	
		return selectedIds;
	}

	dequeuePlayer(playerId: string) {
		this.queues[GameMode.EASY] = this.queues[GameMode.EASY].filter(id => id !== playerId)
		this.queues[GameMode.MEDIUM] = this.queues[GameMode.MEDIUM].filter(id => id !== playerId)
		this.queues[GameMode.HARD] = this.queues[GameMode.HARD].filter(id => id !== playerId)
	}

	isQueueReady(mode: GameMode): boolean {
		return this.queues[mode].length >= this.MIN_NUMBER
	}

	isInQueue(playerId: string, mode: GameMode) {
		return this.queues[mode].includes(playerId)
	}

	enqueueMatch(matchId: string, playersId: string[]) {
		this.playersMatchQueue[matchId] = playersId
	}

	dequeueMatch(matchId: string) {
		if (this.playersMatchQueue[matchId]) {
			delete this.playersMatchQueue[matchId]
		}
	}

	isEnqueuedInMatch(playerId: string): string | undefined {
		for (const matchId in this.playersMatchQueue) {
			if (this.playersMatchQueue[matchId].includes(playerId)) {
				return matchId
			}
		}
		return undefined
	}

}