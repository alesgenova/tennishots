import { Component } from '@angular/core';
import { PeriodListService } from './services/periodlist.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'my-app',
  template: `<div class="container">
  <login></login>
  <!--<period-list></period-list>-->
  </div>
  `,
  providers: [PeriodListService, AuthService]
})
export class AppComponent  {}
