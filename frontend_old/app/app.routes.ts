import { Routes } from '@angular/router';
//import { Home } from './home';
import { TestComponent } from './components/test/test.component';
import { Login } from './components/auth/login.component';
//import { Signup } from './signup';
//import { AuthGuard } from './common/auth.guard';

export const routes: Routes = [
  { path: '',       component: TestComponent },
  { path: 'login',  component: Login },
//  { path: 'home',  component: Test },
//  { path: 'signup', component: Signup },
//  { path: 'home',   component: Home, canActivate: [AuthGuard] },
//  { path: '**',     component: Login },
];
