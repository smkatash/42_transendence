import { Component, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Component({
  selector: 'app-create-channel-button',
  templateUrl: './create-channel-button.component.html',
  styleUrls: ['./create-channel-button.component.css']
})
export class CreateChannelButtonComponent {

  constructor(private el: ElementRef) { }

  @Output() createChannelEvent = new EventEmitter<string>()
  @Output() createDmEvent = new EventEmitter<boolean> ()
  isDropdownSelected: boolean = false;

  createNewChannel(channel: string) {
    this.createChannelEvent.emit(channel);
    this.isDropdownSelected = false;
  }
  
  createNewDM() {
    this.createDmEvent.emit(true)
    this.isDropdownSelected = false;
  }

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
