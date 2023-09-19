import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyProfileComponent } from './my-profile.component';
import { MyProfileRoutingModule } from './my-profile-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FriendComponent } from './friend/friend.component';

@NgModule({
  declarations: [
    MyProfileComponent,
    FriendComponent,
  ],
  imports: [
    CommonModule,
    MyProfileRoutingModule,
    SharedModule
  ]
})
export class MyProfileModule { }
