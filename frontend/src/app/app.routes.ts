import { TestComponent } from './test/test.component';
import { LoginComponent } from './login/login.component';
import {AnalysisComponent } from './analysis/analysis.component';
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '',       component: TestComponent },
  { path: 'login',  component: LoginComponent },
  { path: 'analyze',  component: AnalysisComponent },
//  { path: 'home',  component: Test },
//  { path: 'signup', component: Signup },
//  { path: 'home',   component: Home, canActivate: [AuthGuard] },
//  { path: '**',     component: Login },
];
