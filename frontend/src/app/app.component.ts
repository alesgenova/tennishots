import { Component, OnInit } from '@angular/core';
//import { loggedIn } from './shared/profile.global';
import { AuthService } from './services/auth.service';
//import { TennistatService } from './services/tennistat.service';
import { ProfileService } from './services/profile.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private authService:AuthService,
              //private tennistatService:TennistatService,
              private profileService:ProfileService){}

  ngOnInit(){
      if (this.authService.loggedIn()){
          this.profileService.refreshProfile();
          this.profileService.checkLastChanges();
      }
  }
}
