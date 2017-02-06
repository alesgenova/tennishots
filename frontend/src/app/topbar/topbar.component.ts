import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit {

  loggedIn: boolean = false;
  username: string;

  constructor(private authService: AuthService) { }

  ngOnInit() {
      this.loggedIn = this.authService.loggedIn();
      if (this.loggedIn){
          this.username = localStorage['username'];
      }
  }

}
