import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { User } from 'src/app/user';

@Component({
  selector: 'app-channel-user',
  templateUrl: './channel-user.component.html',
  styleUrls: ['./channel-user.component.css']
})
export class ChannelUserComponent {

  constructor(private el: ElementRef) {}

  @Input() user?: User;
  isDropdownSelected: boolean = false;

  toggleDropdown(): void {
    this.isDropdownSelected = !this.isDropdownSelected;
  }

  @HostListener('document:click', ['$event'])
  closeDropdownOnClickOutside(event: Event) {
    if (this.isDropdownSelected && !this.el.nativeElement.contains(event.target)) {
      this.isDropdownSelected = false;
    }
  }
}
