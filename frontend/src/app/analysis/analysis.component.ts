import { Component, OnInit } from '@angular/core';

import { TennistatService } from '../services/tennistat.service';
import { ProfileService } from '../services/profile.service';

import { SonyFilter, SOFilters, PeriodsPicker, DateRange, NumberRange } from '../objects/sonyfilter';
import { Period, UserPeriodsList } from '../objects/period';
import { SonyResponse } from '../objects/sonyresponse';
import { Label } from '../objects/label';

import {NgbTabChangeEvent} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.css']
})
export class AnalysisComponent implements OnInit {

  userProfile: any;
  userChoices: any[];
  showFilter: boolean = true;
  filter1: SonyFilter = new SonyFilter();
  filter2: SonyFilter = new SonyFilter();
  stats1: SonyResponse = new SonyResponse();
  stats2: SonyResponse = new SonyResponse();
  gotPeriods1 = false;
  gotPeriods2 = false;
  //_filter2: SonyFilter = new SonyFilter(); // aux filter to save/delete the state of filter2 when enabling/disabling comparison

  //filter2: SonyFilter;
  compare: boolean = false;
  comparebtntext: string = "+";

  //
  listOfPeriods1: UserPeriodsList = new UserPeriodsList();
  listOfPeriods2: UserPeriodsList = new UserPeriodsList();
  tagList1: Label[] = [];
  tagList2: Label[] = [];

  imperial_units: boolean = false;

  constructor(private tennistatService: TennistatService, private profileService: ProfileService) { }

  ngOnInit() {
      this.userProfile = this.profileService.getProfile();
      this.userChoices = [];
      this.userChoices.push({username:this.userProfile.user,first_name:"Myself"});
      for (let friend of this.userProfile.friends){
          this.userChoices.push({username:friend.user,first_name:friend.first_name});
      };
      this.imperial_units = (this.userProfile.units == 'M');
      this.filter1.username = this.userProfile.user;
      this.filter2.username = this.userProfile.user;
      this.filter1.imperial_units = this.imperial_units;
      this.filter2.imperial_units = this.imperial_units;
      this.getUserPeriods(this.filter1.username,1);
      this.listOfPeriods2 = this.listOfPeriods1;
      this.gotPeriods2 = true;
      //this.getUserPeriods(this.filter2.username,2);
      this.getTags(this.filter1.username,1);
      this.getTags(this.filter2.username,2);
      //this.tagList2 = this.tagList1
  }

  handleCompareChange() {
      if (!this.compare){
        this.comparebtntext = "-";
      }else{
        this.comparebtntext = "+";
      }
      this.compare = ! this.compare;
  }

  beforeTabChange($event: NgbTabChangeEvent) {
      console.log("I'm here!")
      if ($event.nextId === 'tabS') {
        $event.preventDefault();
    }else if ($event.nextId === 'tabD') {
        $event.preventDefault();
      }
    };

  onUserSelectClick(num:number) {
      if (num ==1){
          //this.gotPeriods1 = false;
          this.listOfPeriods1 = new UserPeriodsList();
          this.getUserPeriods(this.filter1.username,1);
          this.getTags(this.filter1.username,1);
      }else if (num == 2){
          //this.gotPeriods2 = false;
          this.listOfPeriods2 = new UserPeriodsList();
          this.getUserPeriods(this.filter2.username,2);
          this.getTags(this.filter2.username,2);
      }
  }

  getUserPeriods(user:string, num:number){
      this.getPeriods(user, "session", num);
      this.getPeriods(user, "week", num);
      this.getPeriods(user, "month", num);
      this.getPeriods(user, "year", num);
  }

  getPeriods(user:string, name:string, num:number) {
      var periods: Period[];
      this.tennistatService.get_periods(user, name)
        .subscribe(data=>{
            if (num == 1) {
                this.listOfPeriods1[name] = data;
                this.gotPeriods1 = true;
            }else if (num == 2){
                this.listOfPeriods2[name] = data;
                this.gotPeriods2 = true;
            }
      });
  }

  getTags(user:string, num:number) {
      this.tennistatService.get_tags(user)
            .subscribe( res => {
                if (num == 1) {
                    this.tagList1 = res;
                }else if (num == 2) {
                    this.tagList2 = res;
                }
            });
  }

  onSubmitRequest(){
      this.stats1 = new SonyResponse();
      this.stats2 = new SonyResponse();
      this.tennistatService.get_filter_stats(this.filter1)
        .subscribe(data=>{
            this.stats1 = data;
        });
      if (this.compare){
          this.tennistatService.get_filter_stats(this.filter2)
            .subscribe(data=>{
                this.stats2 = data;
            });
      }
      this.showFilter = false;
  }

}
