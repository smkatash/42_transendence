import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Game } from '../utls/game';

@Injectable()
export class GameService {
    constructor() {}

    joinMatch(socket: Socket, gameId: string): void {
        

    }

    getMatch(matchId: string) {
        
    }
}
