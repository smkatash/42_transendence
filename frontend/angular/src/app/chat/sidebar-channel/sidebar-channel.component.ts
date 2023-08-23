import { Component, Input } from '@angular/core';
import { channel } from './channel';

@Component({
  selector: 'app-sidebar-channel',
  templateUrl: './sidebar-channel.component.html',
  styleUrls: ['./sidebar-channel.component.css']
})
export class SidebarChannelComponent {
  @Input() channel?: channel;
}
