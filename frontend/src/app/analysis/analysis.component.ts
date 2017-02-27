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
  gotPeriods1 = true;
  gotPeriods2 = true;
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
      this.onUserSelectClick(1);
      this.onUserSelectClick(2);
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
      this.showFilter = true;
      if ($event.nextId === 'tabS') {
        $event.preventDefault();
      }
    };

  onUserSelectClick(num:number) {
      this.showFilter = true;
      if (num ==1){
          //this.gotPeriods1 = false;
          let activePlayer = this.profileService.getPlayerProfile(this.filter1.username);
          this.listOfPeriods1 = activePlayer.periods;
          this.tagList1 = activePlayer.labels;
      }else if (num == 2){
          //this.gotPeriods2 = false;
          let activePlayer = this.profileService.getPlayerProfile(this.filter2.username);
          this.listOfPeriods2 = activePlayer.periods;
          this.tagList2 = activePlayer.labels;
      }
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
