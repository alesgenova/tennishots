import { Component, OnInit, Input } from '@angular/core';
import { SonyResponse } from '../../objects/sonyresponse';
import { SONY_STROKES } from '../../objects/strokes';

@Component({
  selector: 'display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.css']
})
export class DisplayComponent implements OnInit {
  @Input() stats1: SonyResponse;
  @Input() stats2: SonyResponse;
  @Input() compare: boolean;
  options: Object;
  STROKES = SONY_STROKES;
  expanded: any;

  constructor() { }


  public barChartOptions:any = {
    scaleShowVerticalLines: false,
    responsive: true
  };
  public barChartType:string = 'line';
  public barChartLegend:boolean = false;

  public barChartData:any[] = [
    {data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A'},
    {data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B'}
  ];

  ngOnInit() {
      this.expanded = {
          "FH":false, "FS":false, "FV":false, "SE":false,
          "BH":false, "BS":false, "BV":false, "SM":false
      }
  }

  getStatLabel(stat:string){
      var units_label: string = " (km/h)";
      //var label: string = " (km/h)";
      if (this.stats1.imperial_units){
          units_label = " (mi/h)";
      }
      if (stat == "swing_speed"){
          return "Swing Speed"+units_label
      }else if (stat == "ball_speed"){
          return "Ball Speed"+units_label
      }else if (stat == "ball_spin"){
          return "Ball Spin"
      }
  }
}
