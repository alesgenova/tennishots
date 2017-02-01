import { Component, OnInit } from '@angular/core';
import { SonyFilter } from '../../objects/sonyfilter';

@Component({
  inputs: ["filter"],
  selector: 'sony-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {

  advancedFilter: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  getPeriods() {

  }



}
