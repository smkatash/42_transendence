import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Message } from '../message/message';

@Component({
  selector: 'app-channel-messages-content',
  templateUrl: './channel-messages-content.component.html',
  styleUrls: ['./channel-messages-content.component.css']
})
export class ChannelMessagesContentComponent implements AfterViewInit{
  @ViewChild('messageContainer') messageContainer!: ElementRef;

  @Input() messages?: Message[];

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
  }
}
