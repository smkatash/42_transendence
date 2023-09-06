import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatRoutingModule } from './chat-routing.module';
import { ChatComponent } from './chat.component';
import { MessageComponent } from './message/message.component';
import { SidebarChannelComponent } from './sidebar-channel/sidebar-channel.component';
import { CreateChannelButtonComponent } from './create-channel-button/create-channel-button.component';
import { DefaultContentComponent } from './default-content/default-content.component';
import { ChannelMessagesContentComponent } from './channel-messages-content/channel-messages-content.component';
import { FormsModule } from '@angular/forms';
import { ChannelCreationPageComponent } from './channel-creation-page/channel-creation-page.component';


@NgModule({
  declarations: [
    ChatComponent,
    MessageComponent,
    SidebarChannelComponent,
    CreateChannelButtonComponent,
    DefaultContentComponent,
    ChannelMessagesContentComponent,
    ChannelCreationPageComponent
  ],
  imports: [
    CommonModule,
    ChatRoutingModule,
    FormsModule
  ]
})
export class ChatModule { }
