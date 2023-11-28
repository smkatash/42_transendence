import { Component, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Component({
  selector: 'app-create-channel-button',
  templateUrl: './create-channel-button.component.html',
  styleUrls: ['./create-channel-button.component.css']
})
export class CreateChannelButtonComponent {

  constructor(private el: ElementRef) { }

  @Output() createChannelEvent = new EventEmitter<string>()
  isDropdownSelected: boolean = false;

  createNewChannel(channel: string) {
    this.createChannelEvent.emit(channel);
    this.isDropdownSelected = false;
  }

  toggleDropdown(): void {
    this.isDropdownSelected = !this.isDropdownSelected;
    const dropdownContainer = document.getElementById('dropdownContainer') as HTMLElement
    const dropdownContent = document.getElementById('dropdownMenu') as HTMLElement

    // Get the position of the button relative to the viewport
    const buttonRect = dropdownContainer.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Check if there is enough space below the button, if not, display above
    if (buttonRect.bottom + dropdownContent.offsetHeight > windowHeight) {
      dropdownContent.style.bottom = `${dropdownContainer.clientHeight}px`;
      dropdownContent.style.top = 'auto';
    } else {
      dropdownContent.style.top = `2.7dvw`;
      dropdownContent.style.bottom = 'auto';
    }
  }

  @HostListener('document:click', ['$event'])
  closeDropdownOnClickOutside(event: Event) {
    if (this.isDropdownSelected && !this.el.nativeElement.contains(event.target)) {
      this.isDropdownSelected = false;
    }
  }
}
