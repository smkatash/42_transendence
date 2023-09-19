import { Component, OnInit } from '@angular/core';
import { MyProfileService } from './my-profile.service';
import { User } from '../entities.interface';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {

  constructor(private profileService: MyProfileService){ }

  profile?: User

  friends: User[] = []

  ngOnInit(): void {
    this.getProfile()
  }

  getProfile(): void {
    this.profileService.getProfile(1)
        .subscribe((user: User) => this.profile = user)
    this.profileService.getFriends(1)
        .subscribe((users) => this.friends = users)
  }
}
