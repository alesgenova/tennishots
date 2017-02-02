import { Component, OnInit, Input } from '@angular/core';
import { SonyFilter, PeriodsPicker, DateRange } from '../../objects/sonyfilter';
import {SelectItem} from 'primeng/primeng';

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

  constructor() {
      this.users = [];
      this.users.push({label:'Myself', value:"ales"});
      this.users.push({label:'Pierluigi', value:"lionardo"});
  }

  ngOnInit() {
      this.filter.filters.periods.name = "session";
  }

  handlePeriodChange(e) {
      var index = e.index;
      this.filter.filters.periods = new PeriodsPicker();
      if (index == 0){
        this.filter.filters.periods.name = "session";
    }else if (index == 1){
        this.filter.filters.periods.name = "week";
    }else if (index == 2){
        this.filter.filters.periods.name = "month";
    }else if (index == 3){
        this.filter.filters.periods.name = "year";
    }else if (index == 4){
        //this.filter.filters.periods.name = "session";
      }
  }
  getPeriods() {

  }



}
