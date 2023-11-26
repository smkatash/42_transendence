import { Component, Input, SimpleChanges } from '@angular/core';
import { HOST_IP } from 'src/app/Constants';
import { Channel } from 'src/app/entities.interface';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-sidebar-channel',
  templateUrl: './sidebar-channel.component.html',
  styleUrls: ['./sidebar-channel.component.css']
})
export class SidebarChannelComponent {

  constructor(private chatService: ChatService){}

  public domain = HOST_IP

  @Input() channel?: Channel
  @Input() isSelected = false
  counter: number = 0

  ngOnInit(): void {
    this.chatService.getIncomingMessages()
      .subscribe(message => {
        if (message.channel.id === this.channel?.id){
          if (this.isSelected === false) {
            this.counter++
          }
        }
      })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isSelected']) {
      if (this.isSelected === true) {
        this.counter = 0
      }
    }
  }

}
