import { Socket } from "socket.io";


export interface LobbyInterface {
	id: string
	guestId: string
	ownerClient: Map<string, Socket>
	guestClient?: Map<string, Socket>
}

export class Lobby {
	lobby: LobbyInterface
	
	constructor(id: string, owner: Map<string, Socket>, guestId: string) {
		this.lobby.id = id
		this.lobby.ownerClient = owner
		this.lobby.guestId = guestId
	}

	public getLobby() {
		return this.lobby
	}
}