import { Component, OnInit, Input } from '@angular/core';
import { TennistatService } from '../../services/tennistat.service';

import { SonyFilter, PeriodsPicker, DateRange } from '../../objects/sonyfilter';
import {SelectItem} from 'primeng/primeng';
import { Period, UserPeriodsList } from '../../objects/period';
import { Label } from '../../objects/label';

@Component({
  //inputs: ["filter"],
  selector: 'sony-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {

  @Input() filter: SonyFilter;
  @Input() listOfPeriods: UserPeriodsList;
  @Input() tagList: Label[];
  @Input() expanded: boolean = false;
  @Input() videoOnly: boolean = false;
  advancedFilter: boolean = false;
  users: any[];
  swing_speed: number[] = [0,240];
  ball_speed: number[] = [0,240];
  ball_spin: number[] = [-10,10];
  num1 : number = 0;
  num2 : number = 220;
  periodSelector: boolean[] = [true,false,false,false,false,false];
  sessions: Period[];
  weeks: Period[];
  months: Period[];
  years: Period[];

  constructor(private tennistatService: TennistatService) {
  }

  ngOnInit() {
      this.advancedFilter = this.expanded;
      //this.filter.filters.periods.name = "session";
      /*
      this.getPeriods(localStorage["username"],"sessions");
      this.getPeriods(localStorage["username"],"weeks");
      this.getPeriods(localStorage["username"],"months");
      this.getPeriods(localStorage["username"],"years");
      */
  }

  handlePeriodChange(name) {
      for (var i = 0; i < 7; ++i) { this.periodSelector[i] = false; }
      if (name == "sessions"){
        this.periodSelector[0] = true;
      }else if (name == "weeks"){
        this.periodSelector[1] = true;
      }else if (name == "months"){
        this.periodSelector[2] = true;
      }else if (name == "years"){
        this.periodSelector[3] = true;
      }else if (name == "date_range"){
        this.periodSelector[4] = true;
        this.filter.filters.periods.pks = [];
      }else if (name == "tags"){
        this.periodSelector[5] = true;
    }else if (name == "strokes"){
        this.periodSelector[6] = true;
        //this.filter.filters.periods.name = "session";
      }
  }

  isFilterModified(name:string){
      if (name=='session'){
          if (this.filter.filters.periods.name == name && this.filter.filters.periods.pks.length > 0){
              return '<i><strong>Sessions</strong></i>'
          }else{
              return 'Sessions'
          }
      }
      if (name=='week'){
          if (this.filter.filters.periods.name == name && this.filter.filters.periods.pks.length > 0){
              return '<i><strong>Weeks</strong></i>'
          }else{
              return 'Weeks'
          }
      }
      if (name=='month'){
          if (this.filter.filters.periods.name == name && this.filter.filters.periods.pks.length > 0){
              return '<i><strong>Months</strong></i>'
          }else{
              return 'Months'
          }
      }
      if (name=='year'){
          if (this.filter.filters.periods.name == name && this.filter.filters.periods.pks.length > 0){
              return '<i><strong>Years</strong></i>'
          }else{
              return 'Years'
          }
      }
      if (name=='tags'){
          if (this.filter.filters.labels.length > 0){
              return '<i><strong>Tags</strong></i>'
          }else{
              return 'Tags'
          }
      }
      if (name=='date_range'){
          if (this.filter.filters.date_range.min ||  this.filter.filters.date_range.max){
              return '<i><strong>Date range</strong></i>'
          }else{
              return 'Date range'
          }
      }
      if (name=='strokes'){
          if (this.filter.filters.swing_type.length > 0 && this.filter.filters.swing_type.length < 8){
              return '<i><strong>Strokes</strong></i>'
          }else{
              return 'Strokes'
          }
      }
  }

}
