import { Injectable } from "@nestjs/common";
import { GameMode } from "../utls/game";
import { Socket } from "socket.io";
import { Lobby, LobbyInterface } from "../utls/lobby";

@Injectable()
export class PlayerQueueService {
	private MIN_NUMBER = 2
	private playersMatchQueue: Record<string, string[]> = {}
	private queues: Map<GameMode, Array<Map<string, Socket>>>
	private lobby: Map<GameMode, Array<Lobby>>

	constructor() {
		this.queues = new Map<GameMode, Array<Map<string, Socket>>>()
		this.queues.set(GameMode.EASY, [])
		this.queues.set(GameMode.MEDIUM, [])
		this.queues.set(GameMode.HARD, [])
	}

	enqueue(playerId: string, client: Socket, mode: GameMode): void {
		if (!this.queues.has(mode)) {
			return
		}

		const playerSocketMap = new Map<string, Socket>()
  		playerSocketMap.set(playerId, client)
		this.queues.get(mode).push(playerSocketMap)
	}

	dequeue(mode: GameMode): Array<Map<string, Socket>> {
		const playersInQueue: Array<Map<string, Socket>> = this.queues.get(mode)
		if (!playersInQueue || playersInQueue.length < 2) {
			return [];
		}

		if (playersInQueue.length === 2) {
			this.queues.set(mode, [])
			return playersInQueue
		}

		const selectedIds: Array<Map<string, Socket>> = [];
		const selectedPlayerIds = new Set<string>();

		for (let i = 0; i < this.MIN_NUMBER && i < playersInQueue.length; i++) {
			const randomIndex = Math.floor(Math.random() * playersInQueue.length);
			const selectedMap = playersInQueue[randomIndex];

			for (const playerId of selectedMap.keys()) {
				if (!selectedPlayerIds.has(playerId)) {
					selectedPlayerIds.add(playerId);
					selectedIds.push(selectedMap);
				}
			}

			playersInQueue.splice(randomIndex, 1);
		}

		this.queues.set(mode, playersInQueue);
		return selectedIds;
	}

	dequeuePlayer(playerId: string) {
		const easyQueue = this.queues.get(GameMode.EASY);
		this.queues.set(GameMode.EASY, this.removePlayerFromQueue(easyQueue, playerId));

		const mediumQueue = this.queues.get(GameMode.MEDIUM);
		this.queues.set(GameMode.MEDIUM, this.removePlayerFromQueue(mediumQueue, playerId));

		const hardQueue = this.queues.get(GameMode.HARD);
		this.queues.set(GameMode.HARD, this.removePlayerFromQueue(hardQueue, playerId));
	}

	private removePlayerFromQueue(queue: Array<Map<string, Socket>>, playerId: string): Array<Map<string, Socket>> {
		return queue.filter(playerMap => !playerMap.has(playerId));
	}

	isQueueReady(mode: GameMode): boolean {
		return this.queues.get(mode) && this.queues.get(mode).length >= this.MIN_NUMBER
	}

	isInQueue(playerId: string, mode: GameMode): boolean {
		const playersInQueue = this.queues.get(mode)
		if (!playersInQueue) {
			return false;
		}

		return playersInQueue.some(playerMap => playerMap.has(playerId));
	}

	enqueueMatch(matchId: string, playersId: string[]) {
		this.playersMatchQueue[matchId] = playersId
	}

	dequeueMatch(matchId: string) {
		if (this.playersMatchQueue[matchId]) {
			delete this.playersMatchQueue[matchId]
		}
	}

	isEnqueuedInMatch(playerId: string): string | null {
		for (const matchId in this.playersMatchQueue) {
			if (this.playersMatchQueue[matchId].includes(playerId)) {
				return matchId
			}
		}
		return null
	}

	isInLobby(playerId: string, guestId: string, mode: GameMode): boolean {
		const playersInLobby = this.lobby.get(mode)
		if (!playersInLobby) {
			return false;
		}

		for (const players of playersInLobby) {
			const group = players.getLobby()
			if (group.id === playerId && group.guestId === guestId) {
				return true
			}
			if (group.id === guestId && group.guestId === playerId) {
				return true
			}
		}
		return false
	}


	enterLobby(playerId: string, guestId: string, client: Socket, mode: GameMode): void {
		if (!this.lobby.has(mode)) {
			this.lobby.set(mode,[])
		}

		const playerSocketMap = new Map<string, Socket>()
  		playerSocketMap.set(playerId, client);
		const newLobby = new Lobby(playerId, playerSocketMap, guestId)
		this.lobby.get(mode).push(newLobby);
	}

	checkInLobby(playerId: string, ownerId: string, client: Socket, mode: GameMode): LobbyInterface | null {
		if (!this.lobby.has(mode)) {
			this.lobby.set(mode,[])
		}

		const lobbies = this.lobby.get(mode)

		for (const group of lobbies) {
			const current = group.getLobby()
			if (current.id === ownerId) {
				const playerSocketMap = new Map<string, Socket>()
  				playerSocketMap.set(playerId, client)
				current.guestClient = playerSocketMap
				return current
			}
		}
		return null
	}


} 