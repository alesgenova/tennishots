import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { PeriodsPicker } from '../../objects/sonyfilter';
import { Period, UserPeriodsList } from '../../objects/period';

@Component({
  selector: 'periodlist',
  templateUrl: './periodlist.component.html',
  styleUrls: ['./periodlist.component.css']
})
export class PeriodlistComponent implements OnInit {

  @Input() periodName: string;
  @Input() listOfPeriods: UserPeriodsList;
  @Input() periodsPicker: PeriodsPicker;
  @Input() videoOnly: boolean = false;
  doPagination: boolean;
  nPeriods: number;
  periodsPerPage: number = 8;
  currPage: number;
  periodsSubset: Period[];
  incomingPeriodName: string;

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
      if (changes['listOfPeriods'] != null){
          this.paginate();
      }
    /*for (let propName in changes) {
      let chng = changes[propName];
      let cur  = JSON.stringify(chng.currentValue);
      let prev = JSON.stringify(chng.previousValue);
      this.changeLog.push(`${propName}: currentValue = ${cur}, previousValue = ${prev}`);
    }*/
  }

  ngOnInit() {
      this.incomingPeriodName = this.periodsPicker.name;
      //console.log("periodlist oninit");
      //this.paginate();
  }

  paginate(){
      let periods = [];
      // if videoOnly, only show those periods for which we actually have some videoshots
      if (this.videoOnly){
        for (let period of this.listOfPeriods[this.periodName]){
          if (period.videoshot_count > 0){
            periods.push(period);
          }
        }
      }else{
        periods = this.listOfPeriods[this.periodName];
      }
      this.nPeriods = periods.length;
      this.doPagination = (this.nPeriods > this.periodsPerPage);
      this.currPage = 1;
      if (this.doPagination){
          this.periodsSubset = periods.slice(0,this.periodsPerPage);
      }else{
          this.periodsSubset = periods;
      }
  }


  onSelectAll(all:boolean){
      this.periodsPicker.name = this.periodName;
      this.periodsPicker.pks = [];
      if (all){
          for (let period of this.listOfPeriods[this.periodName]){
              this.periodsPicker.pks.push(period.pk);
          }
      }
  }

  addPkToPks(pk:number) {
      if (this.periodsPicker.name != this.periodName){
          this.periodsPicker.name = this.periodName;
          this.periodsPicker.pks = [];
      }
      if (this.periodsPicker.pks.some(x=>x==pk)) {
          var idx = this.periodsPicker.pks.indexOf(pk);
          this.periodsPicker.pks.splice(idx,1);
      }else {
          this.periodsPicker.pks.push(pk)
      }
      //console.log(pk);
  }

  isInPks(pk:number) {
      //console.log("checking is in "+pk);
      if (this.periodsPicker.pks.some(x=>x==pk)) {
          return true;
      }else {
          return false;
      }
  }

  onPageChange(){
      var start: number;
      var stop: number;
      start = (this.currPage-1)*this.periodsPerPage;
      stop = start+this.periodsPerPage;
      this.periodsSubset = this.listOfPeriods[this.periodName].slice(start,stop);
  }

  getFormattedTag(name:string, category:number){
      if (category == null){
          return name;
      }else if (category == 0){
          return '<span class="badge badge-primary">'+name+'</span>';
      }else if (category == 1){
          return '<span class="badge badge-success">'+name+'</span>';
      }else if (category == 2){
          return '<span class="badge badge-info">'+name+'</span>';
      }else if (category == 3){
          return '<span class="badge badge-warning">'+name+'</span>';
      }else if (category == 4){
          return '<span class="badge badge-danger">'+name+'</span>';
      }else if (category == 5){
          return '<span class="badge badge-default">'+name+'</span>';
      }
  }

}
