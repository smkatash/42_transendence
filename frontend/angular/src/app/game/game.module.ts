import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GameRoutingModule } from './game-routing.module';
import { GameComponent } from './game.component';
import { SharedModule } from '../shared/shared.module';
import { GameBoardComponent } from './game-board/game-board.component';


@NgModule({
  declarations: [
    GameComponent, GameBoardComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    GameRoutingModule,
  ]
})
export class GameModule { }
