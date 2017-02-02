import { Component, OnInit } from '@angular/core';
import { SonyFilter, SOFilters, PeriodsPicker, DateRange, NumberRange } from '../objects/sonyfilter';
import { TennistatService } from '../services/tennistat.service';

@Component({
  selector: 'analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.css']
})
export class AnalysisComponent implements OnInit {

  filter1: SonyFilter = new SonyFilter();
  filter2: SonyFilter = new SonyFilter();
  //_filter2: SonyFilter = new SonyFilter(); // aux filter to save/delete the state of filter2 when enabling/disabling comparison

  //filter2: SonyFilter;
  compare: boolean = false;
  activet1: boolean = true;
  activet2: boolean = false;
  headert2: string = "";
  comparebtntext: string = "Enable Comparison";

  constructor(private tennistatService: TennistatService) { }

  ngOnInit() {
      this.filter1.username = "ales";
      this.filter1.filters = new SOFilters();
      this.filter1.filters.periods = new PeriodsPicker();
      this.filter1.filters.date_range = new DateRange();
      this.filter1.filters.swing_speed = new NumberRange();
      this.filter1.filters.ball_speed = new NumberRange();
      this.filter1.filters.ball_spin = new NumberRange();
      this.filter2.username = "ales";
      this.filter2.filters = new SOFilters();
      this.filter2.filters.periods = new PeriodsPicker();
      this.filter2.filters.date_range = new DateRange();
      this.filter2.filters.swing_speed = new NumberRange();
      this.filter2.filters.ball_speed = new NumberRange();
      this.filter2.filters.ball_spin = new NumberRange();
  }

  handleCompareChange() {
      this.activet1 = true;
      if (!this.compare){
        this.headert2 = "Selection 2"
        this.comparebtntext = "Disable Comparison";
      }else{
        this.headert2 = ""
        this.comparebtntext = "Enable Comparison";
      }
      this.compare = ! this.compare;
      console.log('activated!');
  }

  onSubmitRequest(){

  }

}
