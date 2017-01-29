import { Component } from '@angular/core';
import { PeriodListService } from './services/periodlist.service';
import { Router } from '@angular/router';

@Component({
  selector: 'my-app',
  template: `<div class="container">
  <login></login>
  <period-list></period-list>
  </div>
  `,
  providers: [PeriodListService]
})
export class AppComponent  {
    constructor(public router: Router) {}
}
