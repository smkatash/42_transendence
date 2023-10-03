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
  selectedImage: File | null = null

  ngOnInit(): void {
    this.getProfile()
  }

  getProfile(): void {
    this.profileService.getSessionUser().subscribe((user) => {
      this.profile = user;
      this.profileService.getFriends(this.profile.id).subscribe(friends => this.friends = friends);
    })

    // this.profileService.getMatches(101095)
    //     .subscribe((matches) => this.matches = matches)
  }

  onImageSelected(event: any) {
    this.selectedImage = event.target.files[0]

    if (this.selectedImage) {

      const formData = new FormData()
      formData.append('image', this.selectedImage, this.selectedImage.name)

      if (!this.profile?.id) return

      this.profileService.setAvatar(this.profile.id, formData)
    }
  }
}
