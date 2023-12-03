import { Socket } from "socket.io";

export interface LobbyInterface {
  id: string;
  guestId: string;
  ownerClient: Map<string, Socket>;
  guestClient?: Map<string, Socket>;
}

export class Lobby implements LobbyInterface {
  id: string;
  guestId: string;
  ownerClient: Map<string, Socket>;
  guestClient?: Map<string, Socket>;

  constructor(id: string, owner: Map<string, Socket>, guestId: string) {
    this.id = id;
    (this.ownerClient = owner), (this.guestId = guestId);
  }
}
