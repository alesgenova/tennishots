import { Component, OnInit, Input } from '@angular/core';
import { PeriodsPicker } from '../../objects/sonyfilter';
import { Period } from '../../objects/period';

@Component({
  selector: 'periodlist',
  templateUrl: './periodlist.component.html',
  styleUrls: ['./periodlist.component.css']
})
export class PeriodlistComponent implements OnInit {

  @Input() periods: Period[];
  @Input() periodsPicker: PeriodsPicker;
  doPagination: boolean;
  nPeriods: number;
  periodsPerPage: number = 8;
  currPage: number;
  periodsSubset: Period[];

  constructor() { }

  ngOnInit() {
      this.nPeriods = this.periods.length;
      this.doPagination = (this.nPeriods > this.periodsPerPage);
      this.currPage = 1;
      if (this.doPagination){
          this.periodsSubset = this.periods.slice(0,this.periodsPerPage);
      }else{
          this.periodsSubset = this.periods
      }

  }

  onSelectAll(all:boolean){
      this.periodsPicker.pks = [];
      if (all){
          for (let period of this.periods){
              this.periodsPicker.pks.push(period.pk);
          }
      }
  }

  addPkToPks(pk:number) {
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
      this.periodsSubset = this.periods.slice(start,stop);
  }

}
