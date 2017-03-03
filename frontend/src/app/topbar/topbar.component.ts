import { Component, OnInit, Input } from '@angular/core';
import {trigger, state, style, transition, animate} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';
import { UserProfile } from '../objects/registration';

@Component({
  selector: 'topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
  animations: [
      trigger('slideInOut', [
        state('in', style({
          transform: 'translate3d(0, 0, 0)'
        })),
        state('out', style({
          transform: 'translate3d(-100%, 0, 0)'
        })),
        transition('in => out', animate('400ms ease-in-out')),
        transition('out => in', animate('400ms ease-in-out'))
      ]),
  ]
})
export class TopbarComponent implements OnInit {

  //@Input() Profile: any;
  //loggedOut: boolean = false;
  //loggedIn: boolean = false;
  username: string;
  menuState: string = "out";
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

  toggleSidebar(){
      this.menuState = this.menuState === 'out' ? 'in' : 'out';
  }


}
