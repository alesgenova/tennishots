import { Component, OnInit } from '@angular/core';

import { ProfileService } from '../services/profile.service';
import { TennistatService } from '../services/tennistat.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  recentActivity:any[];

  constructor(private tennistatService: TennistatService, private profileService: ProfileService) { }

  ngOnInit() {
      this.getRecentActivity();
  }

  getProfile(){
      //console.log("got Profile")
      return this.profileService.getProfile();
  }

  getRecentActivity(){
      this.tennistatService.get_recentactivity()
            .subscribe( res => {
                this.recentActivity = res;
            });
  }

}
