import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from 'src/app/entities.interface';
import { ProfileService } from '../profile.service';

@Component({
  selector: 'app-friend',
  templateUrl: './friend.component.html',
  styleUrls: ['./friend.component.css']
})
export class FriendComponent {

  constructor(private profileService: ProfileService) { }

  @Input() user?: User
  // @Output() userChange = new EventEmitter<User>
  @Input() type?: string

  acceptRequest(userID: string) {
    this.profileService.acceptRequest(userID)
    console.log('Ich accepte' + userID)
  }

  declineRequest(userID: string) {
    this.profileService.declineRequest(userID)
  }

}
