import { Component, OnInit } from '@angular/core';
import { MyProfileService } from './my-profile.service';
import { Match, User } from '../entities.interface';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {

  constructor(private profileService: MyProfileService){ }

  profile?: User
  friends: User[] = []
  matches: Match[] = []

  ngOnInit(): void {
    this.getProfile()
  }

  getProfile(): void {
    this.profileService.getProfile()
        .subscribe((user) => console.log(user))

    // this.profileService.getFriends(1)
    //     .subscribe((users) => this.friends = users)

    // this.profileService.getMatches(1)
    //     .subscribe((matches) => this.matches = matches)
  }
}
