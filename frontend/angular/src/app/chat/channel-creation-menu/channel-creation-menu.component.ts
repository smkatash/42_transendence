import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChannelCreateType } from '../chat.enum';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-channel-creation-menu',
  templateUrl: './channel-creation-menu.component.html',
  styleUrls: ['./channel-creation-menu.component.css'],
  animations: [
    trigger('openClose', [
      state('open', style({
        width: '40%',
        left: '0%'
      })),
      state('closed', style({
        width: '40%',
        left: '-42%'
      })),
      transition('open <=> closed', [
        animate('.7s cubic-bezier(.49,.07,.39,.93)'),
      ]),
    ]),
  ],
})
export class ChannelCreationMenuComponent {
  ChannelCreateType: typeof ChannelCreateType = ChannelCreateType;
  @Input() channelType?: ChannelCreateType;
  @Input() isOpen?: boolean;
  @Output() isOpenChange = new EventEmitter<boolean>;

  channelName: string = '';

  toggle(): void {
    this.isOpen = !this.isOpen;
    this.isOpenChange.emit(this.isOpen);
  }

  @Output() publicChannelInfoEmitter = new EventEmitter<string>()
  createPublicChannel(channelName: string): void  {
    // console.log(channelName);
    // console.log('bubu')
    this.publicChannelInfoEmitter.emit(channelName);
  }

  @Output() privateChannelInfoEmitter = new EventEmitter<string>()
  createPrivateChannel(channelName: string): void  {
    // console.log(channelName);
    // console.log('bubu')
    this.publicChannelInfoEmitter.emit(channelName);
  }

  @Output() protectedChannelInfoEmitter = new EventEmitter<string>()
  createProtecctedChannel(channelName: string): void  {
    // console.log(channelName);
    // console.log('bubu')
    this.publicChannelInfoEmitter.emit(channelName);
  }

  @Output() bubuEmitter = new EventEmitter<string>()
  bubu(name: string){
    const bubu = "Bubu"; //fu jad
    this.bubuEmitter.emit(name);
  }
}
