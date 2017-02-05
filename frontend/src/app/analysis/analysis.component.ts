import { Component, OnInit } from '@angular/core';
import { SonyFilter, SOFilters, PeriodsPicker, DateRange, NumberRange } from '../objects/sonyfilter';
import { Period, UserPeriodsList } from '../objects/period';
import { SonyResponse } from '../objects/sonyresponse';
import { TennistatService } from '../services/tennistat.service';

import {NgbTabChangeEvent} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.css']
})
export class AnalysisComponent implements OnInit {

  users: any[];
  showFilter: boolean = true;
  filter1: SonyFilter = new SonyFilter();
  filter2: SonyFilter = new SonyFilter();
  stats1: SonyResponse;
  stats2: SonyResponse;
  //_filter2: SonyFilter = new SonyFilter(); // aux filter to save/delete the state of filter2 when enabling/disabling comparison

  //filter2: SonyFilter;
  compare: boolean = false;
  comparebtntext: string = "+";

  //
  listOfPeriods1: UserPeriodsList = new UserPeriodsList();
  listOfPeriods2: UserPeriodsList = new UserPeriodsList();

  constructor(private tennistatService: TennistatService) { }

  ngOnInit() {
      this.users = [];
      this.users.push({label:'Myself', value:"ales"});
      this.users.push({label:'Pierluigi', value:"lionardo"});
      this.filter1.username = "ales";
      this.filter2.username = "ales";
      this.getUserPeriods(this.filter1.username,1);
      this.getUserPeriods(this.filter2.username,2);
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
          this.getUserPeriods(this.filter1.username,1);
      }else if (num == 2){
          this.getUserPeriods(this.filter2.username,2);
      }
      console.log("CLik"+num)

  }

  getUserPeriods(user:string, num:number){
      this.getPeriods(user, "sessions", num);
      this.getPeriods(user, "weeks", num);
      this.getPeriods(user, "months", num);
      this.getPeriods(user, "years", num);
  }

  getPeriods(user:string, name:string, num:number) {
      var periods: Period[];
      this.tennistatService.get_periods(user, name)
        .subscribe(data=>{
            if (num == 1) {
                this.listOfPeriods1[name] = data;
            }else if (num == 2){
                this.listOfPeriods2[name] = data;
            }
      });
  }

  onSubmitRequest(){
      this.stats1 = new SonyResponse;
      this.stats2 = new SonyResponse;
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
