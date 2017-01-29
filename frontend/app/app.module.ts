import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { AppComponent }  from './app.component';

import {PeriodListComponent} from './components/periodlist/periodlist.component';
import {LoginComponent} from './components/auth/login.component';

@NgModule({
  imports:      [ BrowserModule, HttpModule ],
  declarations: [ AppComponent,
                  PeriodListComponent,
                  LoginComponent
                ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
