import { Component, OnInit, Input } from '@angular/core';
import { TennistatService } from '../../services/tennistat.service';

import { SonyFilter, PeriodsPicker, DateRange } from '../../objects/sonyfilter';
import {SelectItem} from 'primeng/primeng';
import { Period, UserPeriodsList } from '../../objects/period';

@Component({
  //inputs: ["filter"],
  selector: 'sony-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {

  @Input() filter: SonyFilter;
  @Input() listOfPeriods: UserPeriodsList;
  advancedFilter: boolean = false;
  users: any[];
  swing_speed: number[] = [0,240];
  ball_speed: number[] = [0,240];
  ball_spin: number[] = [-10,10];
  num1 : number = 0;
  num2 : number = 220;
  periodSelector: boolean[] = [true,false,false,false,false];
  sessions: Period[];
  weeks: Period[];
  months: Period[];
  years: Period[];

  constructor(private tennistatService: TennistatService) {
  }

  ngOnInit() {
      //this.filter.filters.periods.name = "session";
      /*
      this.getPeriods(localStorage["username"],"sessions");
      this.getPeriods(localStorage["username"],"weeks");
      this.getPeriods(localStorage["username"],"months");
      this.getPeriods(localStorage["username"],"years");
      */
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

}
