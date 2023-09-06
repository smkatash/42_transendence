import { Component, EventEmitter, Output } from '@angular/core';
import { ChannelCreateType } from '../chat.enum';

@Component({
  selector: 'app-create-channel-button',
  templateUrl: './create-channel-button.component.html',
  styleUrls: ['./create-channel-button.component.css']
})
export class CreateChannelButtonComponent {
  @Output() createChannelEvent = new EventEmitter<ChannelCreateType>();

  ChannelCreateType: typeof ChannelCreateType = ChannelCreateType;
  channelType?: ChannelCreateType;

  createNewChannel(channel: ChannelCreateType) {
    this.createChannelEvent.emit(channel);
  }
}
