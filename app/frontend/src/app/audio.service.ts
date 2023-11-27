import { Injectable } from '@angular/core';
import { Howl } from 'howler';

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  // This is for playing background music over everything
  private backgroundMusic: Howl;

  // This is to play the sound when a click in navbar occurs
  private clickSound: Howl

  // Whenever an ACHTUNG pops up
  private errorSound: Howl

  private messageSound: Howl

  private ballHitSound: Howl

  private applaudSound: Howl

  constructor() {
    this.backgroundMusic = new Howl({
      src: ['assets/birkworks-candy-imafooltowantyou-phil-harper.mp3'],
      loop: true,
      volume: 0.3
    })

    this.clickSound = new Howl({
      src: ['assets/click.wav']
    })

    this.errorSound = new Howl({
      src: ['assets/error.wav']
    })

    this.messageSound = new Howl({
      src: ['assets/message.mp3']
    })

    this.ballHitSound = new Howl({
      src: ['assets/ball-hit.mp3']
    })

    this.applaudSound = new Howl({
      src: ['assets/clapping.mp3']
    })
  }

  playBackgroundMusic() {
    this.backgroundMusic.play();
  }

  playClick() {
    this.clickSound.play()
  }

  playError() {
    this.errorSound.play()
  }

  playMessage() {
    this.messageSound.play()
  }

  playBallHit() {
    this.ballHitSound.play()
  }

  playApplaud() {
    this.applaudSound.play()
  }
}
