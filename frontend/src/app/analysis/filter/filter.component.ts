import { Component, OnInit, Input } from '@angular/core';
import { TennistatService } from '../../services/tennistat.service';

import { SonyFilter, PeriodsPicker, DateRange } from '../../objects/sonyfilter';
import {SelectItem} from 'primeng/primeng';
import { Period } from '../../objects/period';

@Component({
  //inputs: ["filter"],
  selector: 'sony-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {

  @Input() filter: SonyFilter;
  advancedFilter: boolean = false;
  users: any[];
  someRange: number[] = [0,220];
  num1 : number = 0;
  num2 : number = 220;
  periodSelector: boolean[] = [true,false,false,false,false];
  sessions: Period[];
  weeks: Period[];
  months: Period[];
  years: Period[];



  constructor(private tennistatService: TennistatService) {
      this.users = [];
      this.users.push({label:'Myself', value:localStorage["username"]});
      this.users.push({label:'Pierluigi', value:"lionardo"});
  }

  ngOnInit() {
      //this.filter.filters.periods.name = "session";
      this.getPeriods(localStorage["username"],"sessions");
      this.getPeriods(localStorage["username"],"weeks");
      this.getPeriods(localStorage["username"],"months");
      this.getPeriods(localStorage["username"],"years");
  }

  handlePeriodChange(name) {
      this.filter.filters.periods.pks = [];
      for (var i = 0; i < 5; ++i) { this.periodSelector[i] = false; }
      if (name == "sessions"){
        this.filter.filters.periods.name = "session";
        this.periodSelector[0] = true;
      }else if (name == "weeks"){
        this.filter.filters.periods.name = "week";
        this.periodSelector[1] = true;
    }else if (name == "months"){
        this.filter.filters.periods.name = "month";
        this.periodSelector[2] = true;
      }else if (name == "years"){
        this.filter.filters.periods.name = "year";
        this.periodSelector[3] = true;
      }else if (name == "date_range"){
        this.periodSelector[4] = true;
        //this.filter.filters.periods.name = "session";
      }
  }
  getPeriods(user:string, name:string) {
      this.tennistatService.get_periods(user, name)
        .subscribe(data=>{
            if (name == "sessions"){
              this.sessions = data;
            }else if (name == "weeks"){
              this.weeks = data;
          }else if (name == "months"){
              this.months = data;
            }else if (name == "years"){
              this.years = data;
            }
            //this.user_get = data.user;
            console.log(data);
      });
  }



}
