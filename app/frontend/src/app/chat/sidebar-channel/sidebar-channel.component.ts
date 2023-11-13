import { Component, Input } from '@angular/core';
import { HOST_IP } from 'src/app/Constants';
import { Channel } from 'src/app/entities.interface';

@Component({
  selector: 'app-sidebar-channel',
  templateUrl: './sidebar-channel.component.html',
  styleUrls: ['./sidebar-channel.component.css']
})
export class SidebarChannelComponent {
  @Input() channel?: Channel
  @Input() isSelected = false
  public domain = HOST_IP
}
