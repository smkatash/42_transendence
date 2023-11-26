import { Component, Input, SimpleChanges, AfterContentInit } from '@angular/core';
import { HOST_IP } from 'src/app/Constants';
import { Channel, User } from 'src/app/entities.interface';
import { ProfileService } from 'src/app/profile/profile.service';

@Component({
  selector: 'app-sidebar-channel',
  templateUrl: './sidebar-channel.component.html',
  styleUrls: ['./sidebar-channel.component.css']
})
export class SidebarChannelComponent {

  public domain = HOST_IP

  @Input() channel?: Channel
  @Input() isSelected = false
}
