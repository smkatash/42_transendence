import { Component, Input } from '@angular/core';
import { AudioService } from 'src/app/audio.service';

@Component({
  selector: 'app-error-message',
  templateUrl: './error-message.component.html',
  styleUrls: ['./error-message.component.css']
})
export class ErrorMessageComponent {
  @Input() message?: any

  constructor(private audioService: AudioService){}

  ngOnInit(): void {
    this.audioService.playError()
  }
}
