import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GameRoutingModule } from './game-routing.module';
import { GameComponent } from './game.component';
import { SharedModule } from '../shared/shared.module';
import { GameMenuComponent } from './game-menu/game-menu.component';


@NgModule({
  declarations: [
    GameComponent, GameMenuComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    GameRoutingModule,
  ]
})
export class GameModule { }