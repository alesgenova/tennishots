import { Component, OnInit, Input } from '@angular/core';

import { Label } from '../../objects/label';


@Component({
  selector: 'taglist',
  templateUrl: './taglist.component.html',
  styleUrls: ['./taglist.component.css']
})
export class TaglistComponent implements OnInit {

  @Input() tagList: Label[];
  @Input() tagsPicker: number[];

  constructor() { }

  ngOnInit() {
  }

  onSelectAll(all:boolean){
      this.tagsPicker = [];
      if (all){
          for (let tag of this.tagList){
              this.tagsPicker.push(tag.pk);
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

  addPkToPks(pk:number) {
      if (this.tagsPicker.some(x=>x==pk)) {
          var idx = this.tagsPicker.indexOf(pk);
          this.tagsPicker.splice(idx,1);
      }else {
          this.tagsPicker.push(pk);
      }
      //console.log(pk);
  }

  getCheckClass(pk:number) {
      //console.log("checking is in "+pk);
      if (this.tagsPicker.some(x=>x==pk)) {
          return 'fa-check-square';
      }else {
          return 'fa-square';
      }
  }

}
