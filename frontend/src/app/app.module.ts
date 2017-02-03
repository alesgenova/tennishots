import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, XSRFStrategy, CookieXSRFStrategy } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

//While the fix angular2-jtw import extra stuff
//import { AUTH_PROVIDERS } from 'angular2-jwt';
import { Http, RequestOptions } from '@angular/http';
import { provideAuth, AuthHttp, AuthConfig } from 'angular2-jwt';

import { AuthService } from './services/auth.service';
import { TennistatService } from './services/tennistat.service';

import { routes } from './app.routes';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { TestComponent } from './test/test.component';
import { AnalysisComponent } from './analysis/analysis.component';
import { FilterComponent } from './analysis/filter/filter.component';
import { ResultsComponent } from './analysis/results/results.component';

// ng2-bootstrap components
import { TabsModule } from 'ng2-bootstrap/tabs';
//import { AlertModule } from 'ng2-bootstrap';
// ng-bootstrap
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { NouisliderComponent } from 'ng2-nouislider';
//font-awesome
import { Angular2FontawesomeModule } from 'angular2-fontawesome/angular2-fontawesome'

import {InputTextModule} from 'primeng/primeng';
import {TabViewModule} from 'primeng/primeng';
import {ToggleButtonModule} from 'primeng/primeng';
import {DropdownModule} from 'primeng/primeng';
import {CalendarModule} from 'primeng/primeng';
import {ListboxModule} from 'primeng/primeng';
import { PeriodlistComponent } from './analysis/periodlist/periodlist.component';

export function authHttpServiceFactory(http: Http, options: RequestOptions) {
  return new AuthHttp( new AuthConfig({'headerPrefix':'JWT'}), http, options);
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    TestComponent,
    AnalysisComponent,
    FilterComponent,
    ResultsComponent,
    NouisliderComponent,
    PeriodlistComponent
  ],
  imports: [
    RouterModule.forRoot(routes),
    BrowserModule,
    FormsModule,
    HttpModule,
    //bootstrap
    TabsModule.forRoot(),
    //NouisliderModule,
    NgbModule.forRoot(),
    //ngprime
    //font-awesome
    Angular2FontawesomeModule,
    InputTextModule,
    TabViewModule,
    ToggleButtonModule,
    DropdownModule,
    CalendarModule,
    ListboxModule,
  ],
  providers: [AuthService, TennistatService,
              {
                provide: AuthHttp,
                useFactory: authHttpServiceFactory,
                deps: [ Http, RequestOptions ]
              },
             //{ provide: XSRFStrategy, useValue: new CookieXSRFStrategy('csrftoken', 'X-CSRFToken') },
             ],
  bootstrap: [AppComponent]
})
export class AppModule { }
