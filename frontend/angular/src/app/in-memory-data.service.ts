import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Channel } from './chat/sidebar-channel/channel';
import { ChannelMessages } from './chat/message/channel-messages';
import { MESSAGES1, MESSAGES2 } from './chat/message/mock-messages';
import { User } from './user';
import { ChannelUsers } from './chat/channel-messages-content/channel-messages-settings/channel-user/channel-users';

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

    /* id here is channel id */
    const messages: ChannelMessages[] = [
      { id: 1, messages: MESSAGES1 },
      { id: 2, messages: MESSAGES2 },
      { id: 3, messages: MESSAGES1 },
      { id: 4, messages: MESSAGES2 },
      { id: 5, messages: MESSAGES1 },
      { id: 6, messages: MESSAGES2 },
    ];

    /* id here is channel id, and id inside users is user id */
    const users: ChannelUsers[] = [
      { id: 1, users: [{id: 1, login: 'jmaalouf'}, {id: 5, login: 'anotheruser'}, {id: 6, login: 'andanotheruser'}, {id: 5, login: 'anotheruser'}, {id: 6, login: 'andanotheruser'}, {id: 5, login: 'anotheruser'}, {id: 6, login: 'andanotheruser'}, {id: 5, login: 'anotheruser'}, {id: 6, login: 'andanotheruser'}, {id: 5, login: 'anotheruser'}, {id: 6, login: 'andanotheruser'}, {id: 5, login: 'anotheruser'}, {id: 6, login: 'andanotheruser'}, {id: 5, login: 'anotheruser'}, {id: 6, login: 'andanotheruser'}, {id: 5, login: 'anotheruser'}, {id: 6, login: 'andanotheruser'}, {id: 5, login: 'anotheruser'}, {id: 6, login: 'andanotheruser'}, {id: 5, login: 'anotheruser'}, {id: 6, login: 'andanotheruser'}, {id: 5, login: 'anotheruser'}, {id: 6, login: 'andanotheruser'}, {id: 5, login: 'anotheruser'}, {id: 6, login: 'andanotheruser'}, {id: 5, login: 'anotheruser'}, {id: 6, login: 'andanotheruser'}, {id: 5, login: 'anotheruser'}, {id: 6, login: 'andanotheruser'}, {id: 5, login: 'anotheruser'}, {id: 6, login: 'andanotheruser'}, {id: 5, login: 'anotheruser'}, {id: 6, login: 'andanotheruser'}]},
      { id: 2, users: [{id: 2, login: 'ktashbae'}, {id: 5, login: 'anotheruser'}, {id: 6, login: 'andanotheruser'}]},
      { id: 3, users: [{id: 3, login: 'frmessin'}, {id: 5, login: 'anotheruser'}, {id: 6, login: 'andanotheruser'}, {id: 6, login: 'andanotheruser'}]},
      { id: 4, users: [{id: 4, login: 'lkrabbe'}, {id: 5, login: 'anotheruser'}, {id: 6, login: 'andanotheruser'}]},
    ];
    return {channels, messages, users};
  }
}
