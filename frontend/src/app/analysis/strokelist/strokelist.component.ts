import { Component, OnInit, Input } from '@angular/core';

import { SONY_STROKES_CHOICES } from '../../objects/strokes';


@Component({
  selector: 'strokelist',
  templateUrl: './strokelist.component.html',
  styleUrls: ['./strokelist.component.css']
})
export class StrokelistComponent implements OnInit {

  @Input() strokesPicker: string[];
  SONY_STROKES_CHOICES = SONY_STROKES_CHOICES;

  constructor() { }

  ngOnInit() {
  }

  onSelectAll(all:boolean){
      let nTags = this.strokesPicker.length
      this.strokesPicker.splice(0,nTags);
      if (all){
          for (let stroke of this.SONY_STROKES_CHOICES){
              this.strokesPicker.push(stroke.key);
          }
      }
  }

  getTagClass(category:number){
      if (category == 0){
          return 'badge-primary'
      }else if (category == 1){
          return 'badge-success'
      }else if (category == 2){
          return 'badge-info'
      }else if (category == 3){
          return 'badge-warning'
      }else if (category == 4){
          return 'badge-danger'
      }else if (category == 5){
          return 'badge-default'
      }
  }

  addPkToPks(stroke:string) {
      if (this.strokesPicker.some(x=>x==stroke)) {
          var idx = this.strokesPicker.indexOf(stroke);
          this.strokesPicker.splice(idx,1);
      }else {
          this.strokesPicker.push(stroke);
      }
      //console.log(pk);
  }

  getCheckClass(stroke:string) {
      //console.log("checking is in "+pk);
      if (this.strokesPicker.some(x=>x==stroke)) {
          return 'fa-check-square';
      }else {
          return 'fa-square';
      }
  }

}
