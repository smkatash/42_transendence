import { Component } from '@angular/core';
import { UserSocket } from 'src/app/app.module';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  constructor(private userSocket: UserSocket) {}

}
