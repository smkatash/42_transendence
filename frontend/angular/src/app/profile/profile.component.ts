import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ProfileService } from './profile.service';
import { Match, Stats, User } from '../entities.interface';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';

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
  requests: User[] = []
  matches: Match[] = []
  rank: number = 0
  stats: Stats = {wins: 0, losses: 0}

  selectedImage: File | null = null
  isEditingName: boolean = false
  isEditingTitle: boolean = false
  isbuttonClicked2FA: boolean = false
  selectedTab: string = 'friends'

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

  private handleError(err: any): void {
    // TODO: Route to Unauthorized or Not found page depending on error
    alert(err.message);
  }

  /* Gets the current user's profile,  */
  getCurrentUserProfile(): void {
    forkJoin({
      currentUser: this.profileService.getCurrentUser(),
      friends: this.profileService.getCurrentUserFriends(),
      requests: this.profileService.getCurrentUserRequests(),
      rank: this.profileService.getCurrentUserRank(),
      stats: this.profileService.getCurrentUserStats(),
      history: this.profileService.getCurrentUserHistory(),
    }).subscribe({
      next: ({ currentUser, friends, requests, rank, stats, history }) => {
        this.profile = currentUser
        this.friends = friends
        this.requests = requests
        this.rank = rank
        this.stats = stats
        this.matches = history
      },
      error: err => this.handleError(err)
    });
  }

  getUserProfile(): void {
    if (!this.id) return
    forkJoin({
      user: this.profileService.getUser(this.id),
      friends: this.profileService.getFriends(this.id),
      rank: this.profileService.getRank(this.id),
      stats: this.profileService.getStats(this.id),
      matches: this.profileService.getHistory(this.id),
    }).subscribe({
      next: ({ user, friends, rank, stats, matches }) => {
        this.profile = user
        this.friends = friends
        this.rank = rank
        this.stats = stats
        this.matches = matches
      },
      error: err => this.handleError(err)
    });
  }

  /* Only used when I want to compare the id with the current id to check if I want to display add friend button */
  getCurrentUserID(): void {
    this.profileService.getCurrentUser()
      .subscribe(user => this.currentUserID = user.id)
  }

  addFriend(): void {
    if (this.id) {
      this.profileService.sendRequest(this.id)
    }
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

  toggle2FA(): void {
    this.isbuttonClicked2FA = !this.isbuttonClicked2FA
    this.cd.detectChanges();
  }

  selectTab(tab: string) {
    if (tab === 'friends') {
      this.selectedTab= 'friends'
    } else {
      this.selectedTab= 'requests'
    }
  }
}
