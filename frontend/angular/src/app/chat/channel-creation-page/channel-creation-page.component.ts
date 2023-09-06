import { Component, Input } from '@angular/core';
import { ChannelCreateType } from '../chat.enum';

@Component({
  selector: 'app-channel-creation-page',
  templateUrl: './channel-creation-page.component.html',
  styleUrls: ['./channel-creation-page.component.css']
})
export class ChannelCreationPageComponent {
  ChannelCreateType: typeof ChannelCreateType = ChannelCreateType;
  @Input() channelType?: ChannelCreateType;
}
