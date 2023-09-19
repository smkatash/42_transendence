import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';

import { MESSAGES1, MESSAGES2 } from './mock-messages';
import { Channel, ChannelMessages, ChannelUsers, User, UserFriend } from './entities.interface';
import { USERS, USERS1 } from './mock-users';

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
    ]

    /* id here is channel id */
    const messages: ChannelMessages[] = [
      { id: 1, messages: MESSAGES1 },
      { id: 2, messages: MESSAGES2 },
      { id: 3, messages: MESSAGES1 },
      { id: 4, messages: MESSAGES2 },
      { id: 5, messages: MESSAGES1 },
      { id: 6, messages: MESSAGES2 },
    ]

    /* id here is channel id */
    const channelUsers: ChannelUsers[] = [
      { id: 1, users: USERS },
      { id: 2, users: USERS1},
      { id: 3, users: USERS},
      { id: 4, users: USERS1},
    ]

    /* id here is the user id which we use to find his friends */
    const friends: UserFriend[] = [
      { id: 1, friends: USERS1 },
      { id: 4, friends: USERS }
    ]

    const users: User[] = USERS

    return {channels, messages, channelUsers, users, friends};
  }
}
