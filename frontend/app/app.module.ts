import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent }  from './app.component';

import { AUTH_PROVIDERS } from 'angular2-jwt';


import { AuthGuard } from './common/auth.guard';

import {PeriodListComponent} from './components/periodlist/periodlist.component';
import {Login} from './components/auth/login.component';

import { routes } from './app.routes';

@NgModule({
  imports:      [ BrowserModule, HttpModule,
                  FormsModule,
                  RouterModule.forRoot(routes, {
                    useHash: true
                    })
                ],
  declarations: [ AppComponent,
                  PeriodListComponent,
                  Login
                ],
  bootstrap:    [ AppComponent ],
  providers:    [
                AuthGuard, ...AUTH_PROVIDERS
                ]
})
export class AppModule { }
