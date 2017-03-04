import { Component, OnInit } from '@angular/core';
import {trigger, state, style, transition, animate} from '@angular/core';
//import { loggedIn } from './shared/profile.global';
import { AuthService } from './services/auth.service';
//import { TennistatService } from './services/tennistat.service';
import { ProfileService } from './services/profile.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
      trigger('slideInOut', [
        state('in', style({
          transform: 'translate3d(0, 0, 0)'
        })),
        state('out', style({
          transform: 'translate3d(-105%, 0, 0)'
        })),
        transition('in => out', animate('400ms ease-in-out')),
        transition('out => in', animate('400ms ease-in-out'))
      ]),
  ]
})
export class AppComponent implements OnInit {

  menuState: string[] = ["out"];

  constructor(private authService:AuthService,
              //private tennistatService:TennistatService,
              private profileService:ProfileService){}

  ngOnInit(){
      if (this.authService.loggedIn()){
          this.profileService.initialize();
          //this.profileService.refreshProfile();
          //this.profileService.checkLastChanges();
      }
  }

  loggedIn(){
      //console.log("loggedIn check")
      return this.authService.loggedIn()
  }

  toggleSidebar(){
      this.menuState[0] = this.menuState[0] === 'out' ? 'in' : 'out';
  }

  closeSidebar(){
      this.menuState[0] = 'out';
  }

  openSidebar(){
      this.menuState[0] = 'in';
  }

}
