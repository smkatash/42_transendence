import { Component, OnInit } from '@angular/core';
import { ProfileService } from './profile.service';
import { Match, Stats, User } from '../entities.interface';
import { catchError, switchMap } from 'rxjs';

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
  rank: number = 0
  stats: Stats = {wins: 0, losses: 0}
  selectedImage: File | null = null

  ngOnInit(): void {
    this.getProfile()
  }

  getProfile(): void {
    this.profileService.getSessionUser()
      .subscribe(user => {
        this.profile = user;

        this.profileService.getFriends(user.id)
          .subscribe(friends => {console.log(friends); this.friends = friends})

        this.profileService.getRank(user.id)
          .subscribe(rank => this.rank = rank)

        this.profileService.getStats()
          .subscribe(stats => this.stats = stats)
/*           this.profileService.getMatches(user.id)
          .subscribe(matches => this.matches = matches) */
      })
  }

  onImageSelected(event: any) {
    this.selectedImage = event.target.files[0]

    if (this.selectedImage && this.selectedImage.size < 10000000) {

      const formData = new FormData()
      formData.append('image', this.selectedImage, this.selectedImage.name)

      // If there's no profile, return early; else set avatar
      if (!this.profile) return

      this.profileService.setAvatar(this.profile.id, formData)
        .subscribe({
          next: (user: User) => this.profile = user,
          error: (error) => alert(error)
      })
    } else {
      alert("File too big!")
    }
  }

/*   onFriendRequest(userID: string): void {
    this.profileService.sendRequest(userID)
  } */
}
