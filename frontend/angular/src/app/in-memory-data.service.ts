import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Channel } from './chat/sidebar-channel/channel';
import { Message } from './chat/message/message';

@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const channels: Channel[] = [
      { id: 1, name: 'Trans and Dance', type: 'protected'},
      { id: 2, name: '42Heilbronn', type: 'public'},
      { id: 3, name: 'world-random', type: 'public'},
      { id: 4, name: 'world-pedagogy', type: 'public'},
      { id: 5, name: '42heilbronn-random', type: 'protected'},
      { id: 6, name: '42heilbronn-global', type: 'public'},
      // { name: '42heilbronn-pedagody', type: 'protected'},
      // { name: '42heilbronn-pedagody', type: 'protected'},
      // { name: '42heilbronn-pedagody', type: 'protected'},
      // { name: '42heilbronn-pedagody', type: 'protected'},
    ];

    const messages: Message[] = [
      { name: 'frmessin', messageContent: 'Would you like to try my pasta?', timestamp: 1, sessionUser: false},
      { name: 'frmessin', messageContent: 'Would you like to try my pasta?', timestamp: 2, sessionUser: false},
      { name: 'frmessin', messageContent: 'Would you like to try my pasta?', timestamp: 3, sessionUser: false},
      { name: 'frmessin', messageContent: 'Would you like to try my pasta?', timestamp: 4, sessionUser: false},
      { name: 'frmessin', messageContent: 'Would you like to try my pasta?', timestamp: 5, sessionUser: false},
      { name: 'ajazbuti', messageContent: 'Wie bitte?', timestamp: 6, sessionUser: false},
      { name: 'ajazbuti', messageContent: "Wann du in Deutschland bist, du musst auf Deutsch sprechen! Ich liebe Deutschland!", timestamp: 4, sessionUser: false},
      { name: 'lkrabbe', messageContent: "I don't like OOP btw", timestamp: 5, sessionUser: false},
      { name: 'jmaalouf', messageContent: "hi", timestamp: 6, sessionUser: true},
      { name: 'jmaalouf', messageContent: "I can already sense that Francesco doesn't like the design for some reason", timestamp: 6, sessionUser: true},
      { name: 'jmaalouf', messageContent: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.", timestamp: 6, sessionUser: true},
      { name: 'ktashbae', messageContent: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.", timestamp: 6, sessionUser: false}
    ];
    return {channels, messages};
  }

}
