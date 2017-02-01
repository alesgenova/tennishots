import { Component, OnInit } from '@angular/core';
import { SonyFilter } from '../objects/sonyfilter';
import { TennistatService } from '../services/tennistat.service';

@Component({
  selector: 'analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.css']
})
export class AnalysisComponent implements OnInit {

  filter1: SonyFilter = new SonyFilter();
  filter2: SonyFilter = new SonyFilter();
  //filter2: SonyFilter;
  compare: boolean = false;

  constructor(private tennistatService: TennistatService) { }

  ngOnInit() {

  }

  onToggleCompare(){

  }

  onSubmitRequest(){

  }

}
