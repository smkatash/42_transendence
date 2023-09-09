import { Component, EventEmitter, Input, Output } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-channel-messages-settings',
  templateUrl: './channel-messages-settings.component.html',
  styleUrls: ['./channel-messages-settings.component.css'],
  animations: [
    trigger('openClose', [
      state('open', style({
        width: '40%',
        right: '0%'
      })),
      state('closed', style({
        width: '40%',
        right: '-42%'
      })),
      transition('open <=> closed', [
        animate('.7s cubic-bezier(.49,.07,.39,.93)'),
      ]),
    ]),
  ],
})
export class ChannelMessagesSettingsComponent {
  @Input() isOpen?: boolean;
  @Output() isOpenChange = new EventEmitter<boolean>;

  toggle(): void {
    this.isOpen = !this.isOpen;
    this.isOpenChange.emit(this.isOpen);
  }
}
