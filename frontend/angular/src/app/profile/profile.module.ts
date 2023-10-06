import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile.component';
import { ProfileRoutingModule } from './profile-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FriendComponent } from './friend/friend.component';
import { MatchComponent } from './match/match.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    ProfileComponent,
    FriendComponent,
    MatchComponent,
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    SharedModule,
    FormsModule
  ]
})
export class ProfileModule { }
