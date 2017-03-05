import { Component, OnInit, Input } from '@angular/core';

import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';
import { NavigationService } from '../services/navigation.service';
import { UserProfile } from '../objects/registration';

import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
})
export class TopbarComponent implements OnInit {

  //@Input() Profile: any;
  @Input() menuState: string[];
  //loggedOut: boolean = false;
  //loggedIn: boolean = false;
  username: string;
  activeSection: string;
  Profile = new UserProfile();
  navbarLogoUrl = "assets/img/logo_nav_small.png"
  navigationSubscription: Subscription;
  topShadow: string = 'down-shadow';
  bottomShadow: string = 'up-shadow';
  colorTop: string = '';

  constructor(private authService: AuthService,
              private profileService: ProfileService,
              private router: Router,
              private navigationService: NavigationService) { }

  ngOnInit() {
      if (this.loggedIn()){
          this.username = localStorage.getItem('username');
          this.Profile = this.getProfile();
      }
      this.navigationSubscription = this.navigationService.activeSection$
        .subscribe(section => {
          this.activeSection = section;
          this.setShadows();
        });
  }

  ngOnDestroy() {
    // prevent memory leak when component is destroyed
    this.navigationSubscription.unsubscribe();
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
      this.menuState[0] = this.menuState[0] === 'out' ? 'in' : 'out';
  }

  setShadows(){
      if (this.activeSection == ""){
          this.bottomShadow = 'up-shadow';
          this.colorTop = "";
      }else{
          this.bottomShadow = 'up-shadow-orange';
          this.colorTop = "orange-top";
      }
    /*
    if (this.activeSection == "home"){
        //this.topShadow = 'down-shadow-orange';
        this.bottomShadow = 'up-shadow-orange';
        this.colorTop = "red-top";
    }else if(this.activeSection == "analysis"){
        //this.topShadow = 'down-shadow-red';
        this.bottomShadow = 'up-shadow-red';
        this.colorTop = "red-top";
        this.colorTop = "red-top";
    }else if(this.activeSection == "progress"){
        //this.topShadow = 'down-shadow-green';
        this.bottomShadow = 'up-shadow-green';
        this.colorTop = "green-top";
        this.colorTop = "red-top";
    }else if(this.activeSection == "video"){
        //this.topShadow = 'down-shadow-blue';
        this.bottomShadow = 'up-shadow-blue';
        this.colorTop = "blue-top";
        this.colorTop = "orange-top";
    }else if(this.activeSection == "services"){
        //this.topShadow = 'down-shadow-purple';
        this.bottomShadow = 'up-shadow-purple';
        this.colorTop = "purple-top";
        this.colorTop = "red-top";
    }else{
        this.topShadow = 'down-shadow';
        this.bottomShadow = 'up-shadow';
        this.colorTop = "";
    }
    */
  }

}
