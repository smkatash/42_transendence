import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ProfileService } from './profile.service';
import { User, UserProfile } from '../entities.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { HOST_IP } from '../Constants';
import { ChatService } from '../chat/chat.service';

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
	public domain = HOST_IP

  constructor(
    private profileService: ProfileService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private auth: AuthService,
    private chatService: ChatService,
    private router: Router) {}

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

    nameToChange: string = ''
    titleToChange: string = ''

    currentUserBlockedList: User[] = []

    errorMessage?: any

  initUserProfile(): UserProfile {
    return {
      user: { id: '', username: '', title: '', avatar: '', email: '', status: 0, mfaEnabled: false, mfaStatus: 0 },
      friends: [],
      receivedRequests: [],
      sentRequests: [],
      matches: [],
      rank: 0,
      stats: { wins: 0, losses: 0 }
    }
  }

  ngOnInit(): void {
    this.chatService.onError()
      .subscribe(error => {
        this.displayError(error.message)
      })
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id')
      if (this.id === null) {
        this.getCurrentUserProfile(ProfileType.USERPROFILE)
      } else {
        this.getUserProfileFromID(this.id, ProfileType.USERPROFILE)
        this.getCurrentUserProfile(ProfileType.CURRENTUSER)
        this.profileService.requestStatus(this.id)
      }
    })

    // Get blocked list of users
    this.chatService.requestBlockedUsers()
    this.chatService.getBlockedUsers()
      .subscribe(blocked => this.currentUserBlockedList = blocked)
  }

  private handleError(err: any): void {
    this.router.navigate(['/profile'])
    this.chatService.generateAchtung(err.message)
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
        this.profileService.statusListener()
          .subscribe(status => this.userProfile.user.status = status)
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

  isUserBlocked(): boolean {
    return this.currentUserBlockedList.some(blockedUser => blockedUser.id === this.userProfile.user.id) || false
  }

  blockUser(): void {
    this.chatService.manageUserModeration('block', this.userProfile.user.id)
  }

  unblockUser(): void {
    this.chatService.manageUserModeration('unblock', this.userProfile.user.id)
  }

  sendRequest(): void {
    if (this.id) {
      this.profileService.sendRequest(this.id)
        .subscribe(user => this.currentUserProfile.sentRequests = user.sentFriendRequests)
    }
  }

  removeFriend(): void {
    if (this.id) {
      this.profileService.removeFriend(this.id)
        .subscribe(user => this.userProfile.friends = user.friends)
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

  isValidString(input: string): boolean {
    // Check if the string is alphanumeric and has length <= 12 and >= 2
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    return alphanumericRegex.test(input) && input.length >= 2 && input.length <= 12;
}

  changeName(): void {
    this.isEditingName = false
    if (this.isValidString(this.nameToChange)) {
      this.profileService.setName(this.nameToChange)
      this.userProfile.user.username = this.nameToChange
      this.nameToChange = ''
    } else {
      this.displayError('Name not valid')
    }
  }

  changeTitle(): void {
    this.isEditingTitle = false
    if (this.isValidString(this.titleToChange)) {
      this.profileService.setTitle(this.titleToChange)
      this.userProfile.user.title = this.titleToChange
      this.titleToChange = ''
    } else {
      this.displayError('Title not valid')
    }
  }

  onImageSelected(event: any) {
    this.selectedImage = event.target.files[0]

    if (this.selectedImage && this.selectedImage.size < 10000000) {

      const formData = new FormData()
      formData.append('image', this.selectedImage, this.selectedImage.name)

      this.profileService.setAvatar(formData)
        .subscribe({
          next: (user: User) => this.userProfile.user = user,
          error: (error) => this.chatService.generateAchtung(error.message)
      })
    } else {
      this.chatService.generateAchtung("File too big!")
    }
  }

  toggle2FADialog(toggle: any) {
    if (toggle === false) {
      this.profileService.getCurrentUser()
        .subscribe(usr => this.userProfile.user.mfaEnabled = usr.mfaEnabled)
    }
    this.isbuttonClicked2FA = !this.isbuttonClicked2FA
    this.cd.detectChanges();
  }

  enable2FA(): void {
    this.toggle2FADialog(true)
  }

  disable2FA(): void {
    this.profileService.disable2FA()
      .subscribe(usr => this.userProfile.user.mfaEnabled = usr.mfaEnabled)
  }

  logout(): void {
    this.auth.logout()
  }

  selectTab(tab: string) {
    if (tab === 'friends') {
      this.selectedTab= 'friends'
      this.getFriends()
    } else {
      this.selectedTab= 'requests'
      this.getReceivedRequests()
    }
  }

  getFriends() {
    this.profileService.getCurrentUserFriends()
      .subscribe({
        next: users => this.userProfile.friends = users,
        complete: () => {
          if (!this.id) return
          this.profileService.getFriends(this.id)
            .subscribe(users => this.userProfile.friends = users)

        }
      })
  }

  getSentRequests() {
    this.profileService.getCurrentUserSentRequests()
      .subscribe(users => this.currentUserProfile.sentRequests = users)
    this.getFriends()
  }

  getReceivedRequests() {
    this.profileService.getCurrentUserReceivedRequests()
      .subscribe(users => this.userProfile.receivedRequests = users)
  }

  displayError(message: any) {
    this.errorMessage = message
    setTimeout(() => {
      this.errorMessage = undefined
    }, 5000)
  }
}
