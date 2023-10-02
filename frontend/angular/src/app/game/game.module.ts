import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

import { GameRoutingModule } from './game-routing.module';
import { GameComponent } from './game.component';
import { SharedModule } from '../shared/shared.module';
import { GameBoardComponent } from './game-board/game-board.component';
import { GameMenuComponent } from './game-menu/game-menu.component';

const config: SocketIoConfig = { url: 'http://localhost:3000', options: {} };

@NgModule({
  declarations: [
    GameComponent, GameBoardComponent, GameMenuComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    GameRoutingModule,
    SocketIoModule.forRoot(config)
  ]
})
export class GameModule { }
