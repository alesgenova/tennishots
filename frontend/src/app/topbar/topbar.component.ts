import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit {

  @Input() Profile: any;
  //loggedOut: boolean = false;
  //loggedIn: boolean = false;
  username: string;

  constructor(private authService: AuthService, private profileService: ProfileService) { }

  ngOnInit() {
      if (this.loggedIn()){
          this.username = localStorage.getItem('username');
      }
  }

  loggedIn(){
      console.log("loggedIn check")
      return this.authService.loggedIn()
  }

  logOut(){
      this.authService.logout();
      this.Profile = null;
  }

  getProfile(){
      return this.profileService.getProfile()
  }

}
