import { Component } from '@angular/core';
import { PeriodListService } from './services/periodlist.service';

@Component({
  selector: 'my-app',
  template: '<period-list></period-list>',
  providers: [PeriodListService]
})
export class AppComponent  {}
