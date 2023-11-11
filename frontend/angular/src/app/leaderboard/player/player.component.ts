import { Component, Input } from '@angular/core';
import { Player } from 'src/app/entities.interface';
import { HOST_IP } from '../../Constants';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent {
  @Input() player?: Player;
  public domain = HOST_IP
}
