import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';
import { UserProfile } from '../objects/registration';

@Component({
  selector: 'topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit {

  //@Input() Profile: any;
  //loggedOut: boolean = false;
  //loggedIn: boolean = false;
  username: string;
  Profile = new UserProfile();
  navbarLogoUrl = "assets/img/logo_nav_small.png"

  constructor(private authService: AuthService, private profileService: ProfileService, private router: Router) { }

  ngOnInit() {
      if (this.loggedIn()){
          this.username = localStorage.getItem('username');
          this.Profile = this.getProfile();
      }
  }

  loggedIn(){
      //console.log("loggedIn check")
      return this.authService.loggedIn()
  }

  logOut(){
      this.authService.logout();
      this.Profile = null;
      this.router.navigate([''])
  }

  getProfile(){
      //console.log("got Profile")
      this.Profile = this.profileService.getProfile();
      return this.Profile
  }

}
