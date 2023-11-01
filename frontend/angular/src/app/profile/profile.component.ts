import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ProfileService } from './profile.service';
import { User, UserProfile } from '../entities.interface';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../auth/auth.service';

enum ProfileType {
  CURRENTUSER,
  USERPROFILE
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  constructor(
    private profileService: ProfileService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private auth: AuthService) {}

    // ID to be extracted from url. If null then we know we're the current user
    id: string | null = null

    selectedImage: File | null = null
    isEditingName: boolean = false
    isEditingTitle: boolean = false
    isbuttonClicked2FA: boolean = false
    selectedTab: string = 'friends'

    // Used to display the info on page
    userProfile: UserProfile = this.initUserProfile()

    // Used for extra logic
    currentUserProfile: UserProfile = this.initUserProfile()

  initUserProfile(): UserProfile {
    return {
      user: { id: '', username: '', title: '', avatar: '', email: '', status: 0, mfaEnable: false, mfaStatus: 0 },
      friends: [],
      receivedRequests: [],
      sentRequests: [],
      matches: [],
      rank: 0,
      stats: { wins: 0, losses: 0 }
    }
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id')
      if (this.id === null) {
        this.getCurrentUserProfile(ProfileType.USERPROFILE)
      } else {
        this.getUserProfileFromID(this.id, ProfileType.USERPROFILE)
        this.getCurrentUserProfile(ProfileType.CURRENTUSER)
      }
    })
  }

  private handleError(err: any): void {
    // TODO: Route to Unauthorized or Not found page depending on error
    alert(err.message);
  }

  /* Gets the current user's profile */
  getCurrentUserProfile(type: ProfileType): void {
    let userProfile = this.initUserProfile()

    forkJoin({
      currentUser: this.profileService.getCurrentUser(),
      friends: this.profileService.getCurrentUserFriends(),
      receivedRequests: this.profileService.getCurrentUserReceivedRequests(),
      sentRequests: this.profileService.getCurrentUserSentRequests(),
      rank: this.profileService.getCurrentUserRank(),
      stats: this.profileService.getCurrentUserStats(),
      history: this.profileService.getCurrentUserHistory(),
    }).subscribe({
      next: ({ currentUser, friends, receivedRequests, sentRequests, rank, stats, history }) => {
        userProfile = {
          user: currentUser,
          friends: friends,
          receivedRequests: receivedRequests,
          sentRequests: sentRequests,
          matches: history,
          rank: rank,
          stats: stats
        }
        if (type === ProfileType.CURRENTUSER) {
          this.currentUserProfile = userProfile
        } else {
          this.userProfile = userProfile
        }
        console.log(userProfile)
      },
      error: err => this.handleError(err)
    });
  }

  getUserProfileFromID(id: string, type: ProfileType): void {
    let userProfile = this.initUserProfile()

    if (!id) return

    forkJoin({
      user: this.profileService.getUser(id),
      friends: this.profileService.getFriends(id),
      rank: this.profileService.getRank(id),
      stats: this.profileService.getStats(id),
      history: this.profileService.getHistory(id),
    }).subscribe({
      next: ({ user, friends, rank, stats, history }) => {
        userProfile = {
          user: user,
          friends: friends,
          receivedRequests: [],
          sentRequests: [],
          matches: history,
          rank: rank,
          stats: stats
        }
        if (type === ProfileType.CURRENTUSER) {
          this.currentUserProfile = userProfile
        } else {
          this.userProfile = userProfile
        }
      },
      error: err => this.handleError(err)
    });
  }

  // Returns true when the current user and the user aren't friends and a request isn't sent by the current user already
  canSendRequest(): boolean {
    return (this.id !== null
      && this.id !== this.currentUserProfile?.user.id
      && !this.isFriendsWithCurrentUser()
      && !this.isRequestSent())
    }

  // Returns true if the user is friends with the current user
  isFriendsWithCurrentUser(): boolean {
    if(this.userProfile === undefined || this.currentUserProfile === undefined) return false
    return this.userProfile.friends.some(user => user.id === this.currentUserProfile?.user.id)
  }

  // Compare with current user's sent request list and check if the user we're looking at is in it
  isRequestSent(): boolean {
    if (this.userProfile === undefined || this.currentUserProfile === undefined) return false
    return this.currentUserProfile.sentRequests.some(user => user.id === this.userProfile?.user.id)
  }

  sendRequest(): void {
    if (this.id) {
      this.profileService.sendRequest(this.id)
        .subscribe(user => this.currentUserProfile.user = user)
    }
  }

  removeFriend(): void {
    if (this.id) {
      this.profileService.removeFriend(this.id).subscribe()
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
    this.profileService.setName(this.userProfile.user.username)
  }

  changeTitle(): void {
    this.isEditingTitle = false
    this.profileService.setTitle(this.userProfile.user.title)
  }

  onImageSelected(event: any) {
    this.selectedImage = event.target.files[0]

    if (this.selectedImage && this.selectedImage.size < 10000000) {

      const formData = new FormData()
      formData.append('image', this.selectedImage, this.selectedImage.name)

      this.profileService.setAvatar(formData)
        .subscribe({
          next: (user: User) => this.userProfile.user = user,
          error: (error) => alert(error.message)
      })
    } else {
      alert("File too big!")
    }
  }

  enable2FA(): void {
    this.isbuttonClicked2FA = !this.isbuttonClicked2FA
    this.cd.detectChanges();
  }

  disable2FA(): void {
    // Code for disabling 2FA
  }

  logout(): void {
    this.auth.logout()
  }

  selectTab(tab: string) {
    if (tab === 'friends') {
      this.selectedTab= 'friends'
    } else {
      this.selectedTab= 'requests'
    }
  }
}
