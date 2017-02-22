import { Component, OnInit, Input } from '@angular/core';
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
  doPagination: boolean;
  nPeriods: number;
  periodsPerPage: number = 8;
  currPage: number;
  periodsSubset: Period[];
  incomingPeriodName: string;

  constructor() { }

  ngOnInit() {
      this.incomingPeriodName = this.periodsPicker.name;
      this.nPeriods = this.listOfPeriods[this.periodName].length;
      this.doPagination = (this.nPeriods > this.periodsPerPage);
      this.currPage = 1;
      if (this.doPagination){
          this.periodsSubset = this.listOfPeriods[this.periodName].slice(0,this.periodsPerPage);
      }else{
          this.periodsSubset = this.listOfPeriods[this.periodName]
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
