import { Component, OnInit, Input } from '@angular/core';
import { PeriodsPicker } from '../../objects/sonyfilter';
import { Period } from '../../objects/period';

@Component({
  selector: 'periodlist',
  templateUrl: './periodlist.component.html',
  styleUrls: ['./periodlist.component.css']
})
export class PeriodlistComponent implements OnInit {

  @Input() periods: Period;
  @Input() periodsPicker: PeriodsPicker;

  constructor() { }

  ngOnInit() {
  }

}
