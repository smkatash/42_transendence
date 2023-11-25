import { Component, Input } from '@angular/core';
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

  userStatus?: number

  constructor(private profileService: ProfileService){}

  // ngOnInit(): void {
  //   if (this.channel?.type === 'direct') {
  //     this.profileService.requestStatus(this.channel.users.)
  //     this.profileService.statusListener()
  //       .subscribe(status => this.userStatus = status)
  //   }
  // }

}
