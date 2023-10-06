import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ProfileService } from './profile.service';
import { Match, Stats, User } from '../entities.interface';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  constructor(private profileService: ProfileService, private route: ActivatedRoute, private cd: ChangeDetectorRef){ }

  id: string | null = null
  currentUserID: string | null = null
  profile?: User
  friends: User[] = []
  matches: Match[] = []
  rank: number = 0
  stats: Stats = {wins: 0, losses: 0}

  selectedImage: File | null = null
  isEditingName: boolean = false
  isEditingTitle: boolean = false

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id')
      if (this.id === null) {
        this.getCurrentUserProfile()
      } else {
        this.getUserProfile()
        this.getCurrentUserID()
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

  /* Only used when I want to compare the id with the current id to check if I want to display add friend button */
  getCurrentUserID(): void {
    this.profileService.getCurrentUser()
      .subscribe(user => this.currentUserID = user.id)
  }

  toggleNameEdit(): void {
    this.isEditingName = !this.isEditingName
    this.cd.detectChanges();
  }

  toggleTitleEdit(): void {
    this.isEditingTitle = !this.isEditingTitle
    this.cd.detectChanges();
  }

  changeName(): void {
    this.isEditingName = false
    if (this.profile) {
      this.profileService.setName(this.profile.username)
    }
  }

  changeTitle(): void {
    this.isEditingTitle = false
    if (this.profile) {
      this.profileService.setTitle(this.profile.title)
    }
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
