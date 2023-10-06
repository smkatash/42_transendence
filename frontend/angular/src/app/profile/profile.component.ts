import { Component, OnInit } from '@angular/core';
import { ProfileService } from './profile.service';
import { Match, Stats, User } from '../entities.interface';
import { catchError, fromEvent, switchMap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  constructor(private profileService: ProfileService, private route: ActivatedRoute){ }

  id: string | null = null
  profile?: User
  friends: User[] = []
  matches: Match[] = []
  rank: number = 0
  stats: Stats = {wins: 0, losses: 0}
  selectedImage: File | null = null

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id')
      if (this.id === null) {
        this.getCurrentUserProfile()
      } else {
        this.getUserProfile()
      }
    })
  }

  getCurrentUserProfile(): void {
    this.profileService.getCurrentUser()
      .subscribe({
        next: user => this.profile = user,
        error: err => alert(err.message) // TODO: Route to Unauthorized or Not found page depending on error
      })

    this.profileService.getCurrentUserFriends()
      .subscribe({
        next: friends => {console.log(friends); this.friends = friends},
        error: err => alert(err.message) // TODO: Route to Unauthorized or Not found page depending on error
      })

    this.profileService.getCurrentUserStats()
      .subscribe({
        next: stats => this.stats = stats,
        error: err => alert(err.message) // TODO: Route to Unauthorized or Not found page depending on error
      })
  }

  getUserProfile(): void {
    if (!this.id) return

    this.profileService.getUser(this.id)
      .subscribe({
        next: user => this.profile = user,
        error: err => alert(err.message) // TODO: Route to Unauthorized or Not found page depending on error
      })

    this.profileService.getFriends(this.id)
      .subscribe({
        next: friends => {console.log(friends); this.friends = friends},
        error: err => alert(err.message) // TODO: Route to Unauthorized or Not found page depending on error
      })


  }

  onImageSelected(event: any) {
    this.selectedImage = event.target.files[0]

    if (this.selectedImage && this.selectedImage.size < 10000000) {

      const formData = new FormData()
      formData.append('image', this.selectedImage, this.selectedImage.name)

      this.profileService.setAvatar(formData)
        .subscribe({
          next: (user: User) => this.profile = user,
          error: (error) => alert(error.message)
      })
    } else {
      alert("File too big!")
    }
  }

/*   onFriendRequest(userID: string): void {
    this.profileService.sendRequest(userID)
  } */
}
