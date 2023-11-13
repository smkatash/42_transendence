import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LeaderboardRoutingModule } from './leaderboard-routing.module';
import { LeaderboardComponent } from './leaderboard.component';
import { SharedModule } from '../shared/shared.module';
import { PlayerComponent } from './player/player.component';


@NgModule({
  declarations: [
    LeaderboardComponent, PlayerComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    LeaderboardRoutingModule,
  ]
})

export class LeaderboardModule { }
