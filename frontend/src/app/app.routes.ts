import { TestComponent } from './test/test.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { RegisterComponent } from './register/register.component';
import {AnalysisComponent } from './analysis/analysis.component';
import { Routes } from '@angular/router';

export const routes: Routes = [
  //{ path: '',       component: TestComponent },
  { path: 'login',  component: LoginComponent },
  { path: 'logout',  component: LogoutComponent },
  { path: 'register',  component: RegisterComponent },
  { path: 'analyze',  component: AnalysisComponent },
//  { path: 'home',  component: Test },
//  { path: 'signup', component: Signup },
//  { path: 'home',   component: Home, canActivate: [AuthGuard] },
//  { path: '**',     component: Login },
];
