import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'

import { TennistatService } from '../services/tennistat.service';

@Component({
  selector: 'boxplot',
  templateUrl: './boxplot.component.html',
  styleUrls: ['./boxplot.component.css']
})
export class BoxplotComponent implements OnInit {

  @Input() plots: any[];

  constructor(private tennistatService: TennistatService,
              private sanitizer: DomSanitizer) { }

  ngOnInit() { }

}
