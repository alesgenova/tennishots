import { Component } from '@angular/core';
import { PeriodListService } from './services/periodlist.service';
import { TestService } from './services/test.service';
import { Router } from '@angular/router';

@Component({
  selector: 'my-app',
  template: `<div class="container">
  <router-outlet></router-outlet>
  </div>
  `,
  providers: [PeriodListService,TestService]
})
export class AppComponent  {
    constructor(public router: Router) {}
}
