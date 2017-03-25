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
  mi2km = 1.60934;
  options: Object;
  showGraph = true;
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

  onSwitchDisplay(bool:boolean){
    this.showGraph = bool;
  }

  getStatLabel(stat:string, showUnits:boolean){
      var units_label: string = "";

      if (showUnits){
        if (this.stats1.imperial_units){
            units_label = " (mi/h)";
        }else{
            units_label = " (km/h)";
        }
      }

      if (stat == "swing_speed"){
          return "Swing Speed"+units_label
      }else if (stat == "ball_speed"){
          return "Ball Speed"+units_label
      }else if (stat == "ball_spin"){
          return "Ball Spin"
      }
  }

  renderPercentile(value:number, stat:string){
    if (value == -100){
      return "<span class='small'>N/A</span>"
    }
    if (stat == 'ball_spin'){
      if (value > 0){
        return "+"+Math.round(value)
      }else{
        return Math.round(value)
      }
    }
    let imperial_units = this.stats1.imperial_units;
    if (imperial_units){
      return Math.round(value/this.mi2km) + " <span class='small'>mi/h</span>"
    }else{
      return Math.round(value) + " <span class='small'>km/h</span>"
    }
  }
}
