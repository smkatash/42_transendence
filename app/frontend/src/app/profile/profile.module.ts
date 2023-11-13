import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile.component';
import { ProfileRoutingModule } from './profile-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FriendComponent } from './friend/friend.component';
import { MatchComponent } from './match/match.component';
import { FormsModule } from '@angular/forms';
import { TwofactorauthComponent } from './twofactorauth/twofactorauth.component';

@NgModule({
  declarations: [
    ProfileComponent,
    FriendComponent,
    MatchComponent,
    TwofactorauthComponent,
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    SharedModule,
    FormsModule
  ]
})
export class ProfileModule { }
