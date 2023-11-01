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

  // TODO Jad bitch fix automatic update
  @Input() user?: User
  @Output() userChange = new EventEmitter<User>
  @Input() type?: string

  acceptRequest(userID: string) {
    this.profileService.acceptRequest(userID)
	  .subscribe(user => {
		this.user = user
		this.userChange.emit(this.user)
	  })
  }

  declineRequest(userID: string) {
	console.log("decline " + userID)
    this.profileService.declineRequest(userID).subscribe()
  }

}
