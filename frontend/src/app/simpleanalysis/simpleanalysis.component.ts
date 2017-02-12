import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { ProfileService } from '../services/profile.service';
import { TennistatService } from '../services/tennistat.service';

import { SonyFilter, SOFilters, PeriodsPicker, DateRange, NumberRange } from '../objects/sonyfilter';
import { Period, UserPeriodsList } from '../objects/period';
import { SonyResponse } from '../objects/sonyresponse';

import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-simpleanalysis',
  templateUrl: './simpleanalysis.component.html',
  styleUrls: ['./simpleanalysis.component.css']
})
export class SimpleanalysisComponent implements OnInit {

    userChoices: any[];
    stats = new SonyResponse();
    listOfPeriods = new UserPeriodsList();
    activeUser: string;
    activePk: number = -1;
    activePeriod: string = 'session';
    previousUser: string = '';
    userProfile: any;
    doPagination: boolean;
    nPeriods: number;
    periodsPerPage: number = 6;
    currPage: number;
    periodsSubset: Period[];

  constructor(  private route: ActivatedRoute,
                private router: Router,
                private profileService: ProfileService,
                private tennistatService: TennistatService) { }

  ngOnInit() {
      this.userProfile = this.profileService.getProfile();
      this.activeUser = this.route.snapshot.params['user'];
      if (this.activeUser == null){
          this.activeUser = this.userProfile.user;
      }
      if (this.activeUser == this.userProfile.user){

      }else{
          if (this.userProfile.friends.some(x=>x.user==this.activeUser)){
          }else{
              this.router.navigate(['summary']);
          }
      }
      this.userChoices = [];
      this.userChoices.push({username:this.userProfile.user,first_name:"Myself"});
      for (let friend of this.userProfile.friends){
          this.userChoices.push({username:friend.user,first_name:friend.first_name});
      };
      this.onUserSelectClick();
  }

  onUserSelectClick() {
      if (!(this.activeUser == this.previousUser)){
          this.listOfPeriods = new UserPeriodsList();
          this.getUserPeriods(this.activeUser);
          //this.onPeriodChange(this.activePeriod);
          this.previousUser = this.activeUser;
          this.activePk = -1
          if (this.activePeriod == 'all'){
              this.onPeriodSelect(0);
          }
      }
  }

  getUserPeriods(user:string){
      this.getPeriods(user, "session");
      this.getPeriods(user, "week");
      this.getPeriods(user, "month");
      this.getPeriods(user, "year");
  }

  getPeriods(user:string, name:string) {
      this.tennistatService.get_periods(user, name+'s')
        .subscribe(data=>{
            this.listOfPeriods[name] = data;
            if (name == this.activePeriod){
                this.onPeriodChange(name);
            }
        });
  }

  onPeriodChange(name:string){
      this.activePeriod = name;
      if (name == 'all'){
          this.periodsSubset = [];
          this.onPeriodSelect(0);
      }else{
          this.nPeriods = this.listOfPeriods[name].length;
          this.doPagination = (this.nPeriods > this.periodsPerPage);
          this.currPage = 1;
          console.log(this.nPeriods, this.doPagination)
          if (this.doPagination){
              this.periodsSubset = this.listOfPeriods[name].slice(0,this.periodsPerPage);
          }else{
              this.periodsSubset = this.listOfPeriods[name]
          }
      }
  }

  onPeriodSelect(pk:number){
      if (!(pk==this.activePk)){
          let filter = new SonyFilter();
          filter.username = this.activeUser;
          if (pk==0){
              filter.filters.periods.name = "session"; // doesn't matter, we're taking all shots
              filter.filters.periods.pks = [];
          }else{
              filter.filters.periods.name = this.activePeriod;
              filter.filters.periods.pks = [pk];
          }
          this.activePk = pk;
          //this.stats = new SonyResponse();
          this.tennistatService.get_filter_stats(filter)
            .subscribe(data=>{
                this.stats = data;
            });
      }
  }
}
