import { Component, Input } from '@angular/core';
import { message } from './message';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent {
  @Input() msg?: message;
  @Input() sameSender: boolean = false;
}
