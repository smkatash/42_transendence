import { Component, Input } from '@angular/core';
import { Channel, Message } from 'src/app/entities.interface';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent {
  channel: Channel | null = null
  @Input() msg?: Message;
  @Input() sameSender: boolean = false;
}
