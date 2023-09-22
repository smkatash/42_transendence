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
import { ChannelCreationMenuComponent } from './channel-creation-menu/channel-creation-menu.component';
import { ChannelMessagesSettingsComponent } from './channel-messages-content/channel-messages-settings/channel-messages-settings.component';
import { ChannelUserComponent } from './channel-messages-content/channel-messages-settings/channel-user/channel-user.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    ChatComponent,
    MessageComponent,
    SidebarChannelComponent,
    CreateChannelButtonComponent,
    DefaultContentComponent,
    ChannelMessagesContentComponent,
    ChannelCreationMenuComponent,
    ChannelMessagesSettingsComponent,
    ChannelUserComponent
  ],
  imports: [
    CommonModule,
    ChatRoutingModule,
    FormsModule,
    SharedModule,
  ]
})
export class ChatModule { }
