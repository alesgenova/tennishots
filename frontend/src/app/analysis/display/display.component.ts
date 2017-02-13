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


  public chartOptions:any = {
    scaleShowVerticalLines: false,
    responsive: true,
    scales: {
        yAxes: [{
            ticks:{
                display:false,
                //suggestedMin:0.,
                //suggestedMax:1.05,
                stepSize: 0.01
            },
            gridLines:{display:false}
                }],
        xAxes: [{
            gridLines:{display:false}
                }],
            },
  };
  public chartType:string = 'line';
  public chartLegend:boolean = false;

  public chartColors:Array<any> = [
  { // grey
    pointRadius: 0,
    //borderColor: 'rgba(245,85,54,0.8)',//"#C9302C"
    borderColor: 'rgba(169,68,66,0.8)',
    backgroundColor: 'rgba(245,85,54,0.2)',
  },
  { // grey
    pointRadius: 0,
    //borderColor: 'rgba(32,164,243,0.8)', //"#025AA5"
    borderColor: 'rgba(49,112,143,0.8)',
    backgroundColor: 'rgba(32,164,243,0.2)'
  }
]

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
