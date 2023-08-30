import { Component, Input } from '@angular/core';
import { Channel } from './channel';

@Component({
  selector: 'app-sidebar-channel',
  templateUrl: './sidebar-channel.component.html',
  styleUrls: ['./sidebar-channel.component.css']
})
export class SidebarChannelComponent {
  @Input() channel?: Channel;
  @Input() isSelected = false;
}
