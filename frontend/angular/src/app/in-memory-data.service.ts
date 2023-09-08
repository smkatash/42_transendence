import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Channel } from './chat/sidebar-channel/channel';
import { ChannelMessages } from './chat/message/channel-messages';
import { MESSAGES1, MESSAGES2 } from './chat/message/mock-messages';
import { User } from './user';

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
    ];

    const messages: ChannelMessages[] = [
      { id: 1, messages: MESSAGES1 },
      { id: 2, messages: MESSAGES2 },
      { id: 3, messages: MESSAGES1 },
      { id: 4, messages: MESSAGES2 },
      { id: 5, messages: MESSAGES1 },
      { id: 6, messages: MESSAGES2 },
    ];
    const users: User[] = [
      { id: 1, login: 'jmaalouf'},
      { id: 2, login: 'ktashbae'},
      { id: 3, login: 'frmessin'},
      { id: 4, login: 'lkrabbe'},
    ];
    return {channels, messages, users};
  }
}
