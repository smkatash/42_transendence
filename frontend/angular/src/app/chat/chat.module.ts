import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatRoutingModule } from './chat-routing.module';
import { ChatComponent } from './chat.component';
import { MessageComponent } from './message/message.component';
import { SidebarChannelComponent } from './sidebar-channel/sidebar-channel.component';
import { CreateChannelButtonComponent } from './create-channel-button/create-channel-button.component';


@NgModule({
  declarations: [
    ChatComponent,
    MessageComponent,
    SidebarChannelComponent,
    CreateChannelButtonComponent
  ],
  imports: [
    CommonModule,
    ChatRoutingModule
  ]
})
export class ChatModule { }
