import { Component, Input } from '@angular/core';
import { User } from 'src/app/entities.interface';

@Component({
  selector: 'app-friend',
  templateUrl: './friend.component.html',
  styleUrls: ['./friend.component.css']
})
export class FriendComponent {
  @Input() user?: User
  @Input() type?: string
}
