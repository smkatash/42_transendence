import { Component, OnInit } from '@angular/core';
import { ProfileService } from './profile.service';
import { Match, User } from '../entities.interface';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  constructor(private profileService: ProfileService){ }

  profile?: User
  friends: User[] = []
  matches: Match[] = []

  ngOnInit(): void {
    this.getProfile()
  }

  getProfile(): void {
    this.profileService.getProfile(101095)
        .subscribe((user: User) => this.profile = user)

    this.profileService.getFriends(101095)
        .subscribe((users) => this.friends = users)

    this.profileService.getMatches(101095)
        .subscribe((matches) => this.matches = matches)
  }
}
