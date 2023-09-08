import { Component, Input } from '@angular/core';
import { ChannelCreateType } from '../chat.enum';

@Component({
  selector: 'app-channel-creation-menu',
  templateUrl: './channel-creation-menu.component.html',
  styleUrls: ['./channel-creation-menu.component.css']
})
export class ChannelCreationMenuComponent {
  ChannelCreateType: typeof ChannelCreateType = ChannelCreateType;
  @Input() channelType?: ChannelCreateType;
}
