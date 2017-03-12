import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ProfileService } from '../services/profile.service';
import { TennistatService } from '../services/tennistat.service';
import { NavigationService } from '../services/navigation.service';

import { SonyFilter } from '../objects/sonyfilter';
import { SonyResponse } from '../objects/sonyresponse';

import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  user: string;
  userProfile: any;
  playerProfile: any;
  recentActivity:any[];
  sessionsStats: SonyResponse[] = [];
  sessionsExpand: boolean[] = [];
  emptyResponse = new SonyResponse();
  playerProfileSubscription: Subscription;
  userProfileSubscription: Subscription;

  constructor(private router: Router,
              private tennistatService: TennistatService,
              private profileService: ProfileService,
              private navigationService: NavigationService) { }

  ngOnInit() {
      this.navigationService.setActiveSection("home");
      this.user = this.profileService.getUsername();

      this.userProfileSubscription = this.profileService.userProfile$
        .subscribe(profile => {
            this.userProfile = profile;
        });

      this.playerProfileSubscription = this.profileService.playerProfiles$
        .subscribe(profiles => {
          this.playerProfile = profiles[this.user];
          if (this.playerProfile.shot_count == 0){
            this.router.navigate(['/landing']);
          }
        });
      this.getRecentActivity();
      //this.playerProfile = this.profileService.getPlayerProfile("");
  }

  ngOnDestroy() {
    // prevent memory leak when component is destroyed
    this.playerProfileSubscription.unsubscribe();
    this.userProfileSubscription.unsubscribe();
  }

  getRecentActivity(){
      this.tennistatService.get_recentactivity()
            .subscribe( res => {
                this.recentActivity = res;
                for (let i in res){
                    //console.log("ires"+i)
                    this.sessionsStats.push(new SonyResponse());
                    this.sessionsExpand.push(false);
                };
            });
  }

  getSessionStats(iRecent:number, user:string, sessionpk:number){
      if (this.sessionsStats[iRecent].count == 0){
          let filter = new SonyFilter();
          let imperial_units = (this.userProfile.units == 'M');
          filter.imperial_units = imperial_units;
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

  getFormattedTag(name:string, category:number){
      if (category == null){
          return name;
      }else if (category == 0){
          return '<span class="badge badge-primary">'+name+'</span>';
      }else if (category == 1){
          return '<span class="badge badge-success">'+name+'</span>';
      }else if (category == 2){
          return '<span class="badge badge-info">'+name+'</span>';
      }else if (category == 3){
          return '<span class="badge badge-warning">'+name+'</span>';
      }else if (category == 4){
          return '<span class="badge badge-danger">'+name+'</span>';
      }else if (category == 5){
          return '<span class="badge badge-default">'+name+'</span>';
      }
  }

}
