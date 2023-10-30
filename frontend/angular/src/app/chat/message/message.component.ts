import { Component, Input } from '@angular/core';
import { Message } from 'src/app/entities.interface';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent {
  @Input() msg?: Message;
  @Input() sameSender: boolean = false;
}
