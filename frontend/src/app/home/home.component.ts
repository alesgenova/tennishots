import { Component, OnInit } from '@angular/core';

import { ProfileService } from '../services/profile.service';
import { TennistatService } from '../services/tennistat.service';

import { SonyFilter } from '../objects/sonyfilter';
import { SonyResponse } from '../objects/sonyresponse';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  recentActivity:any[];
  sessionsStats: SonyResponse[] = [];
  sessionsExpand: boolean[] = [];
  emptyResponse = new SonyResponse();

  constructor(private tennistatService: TennistatService, private profileService: ProfileService) { }

  ngOnInit() {
      this.getRecentActivity();
      //this.getSessionStats('ales', 109);
  }

  getProfile(){
      //console.log("got Profile")
      return this.profileService.getProfile();
  }

  getRecentActivity(){
      this.tennistatService.get_recentactivity()
            .subscribe( res => {
                this.recentActivity = res;
                for (let i in res){
                    console.log("ires"+i)
                    this.sessionsStats.push(new SonyResponse());
                    this.sessionsExpand.push(false);
                };
            });
  }

  getSessionStats(iRecent:number, user:string, sessionpk:number){
      if (this.sessionsStats[iRecent].count == 0){
          let filter = new SonyFilter();
          filter.username = user;
          filter.filters.periods.name = 'session';
          filter.filters.periods.pks = [sessionpk];

          this.tennistatService.get_filter_stats(filter)
            .subscribe(data=>{
                this.sessionsStats[iRecent] = data;
            });
      }
  }

  onSessionExpand(i:number){
      if (this.sessionsExpand[i]){
          this.sessionsExpand[i] = false;
      }else{
          let username = this.recentActivity[i].player.user;
          let pk = this.recentActivity[i].pk;
          this.getSessionStats(i, username, pk);
          this.sessionsExpand[i] = true;
      }
  }

}