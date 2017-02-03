import { Component, OnInit } from '@angular/core';
import { SonyFilter, SOFilters, PeriodsPicker, DateRange, NumberRange } from '../objects/sonyfilter';
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
  //_filter2: SonyFilter = new SonyFilter(); // aux filter to save/delete the state of filter2 when enabling/disabling comparison

  //filter2: SonyFilter;
  compare: boolean = false;
  comparebtntext: string = "+";

  constructor(private tennistatService: TennistatService) { }

  ngOnInit() {
      this.users = [];
      this.users.push({label:'Myself', value:"ales"});
      this.users.push({label:'Pierluigi', value:"lionardo"});
      this.filter1.username = "ales";
      this.filter1.filters = new SOFilters();
      this.filter1.filters.periods = new PeriodsPicker();
      this.filter1.filters.periods.name = "session"
      this.filter1.filters.date_range = new DateRange();
      this.filter1.filters.swing_speed = new NumberRange();
      this.filter1.filters.ball_speed = new NumberRange();
      this.filter1.filters.ball_spin = new NumberRange();
      this.filter2.username = "ales";
      this.filter2.filters = new SOFilters();
      this.filter2.filters.periods = new PeriodsPicker();
      this.filter2.filters.periods.name = "session"
      this.filter2.filters.date_range = new DateRange();
      this.filter2.filters.swing_speed = new NumberRange();
      this.filter2.filters.ball_speed = new NumberRange();
      this.filter2.filters.ball_spin = new NumberRange();
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

  onUserSelectClick() {
      console.log("CLik")
  }

  onSubmitRequest(){

  }

}
