import { TestComponent } from './test/test.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { RegisterComponent } from './register/register.component';
import { AnalysisComponent } from './analysis/analysis.component';
import { SimpleanalysisComponent } from './simpleanalysis/simpleanalysis.component';
import { ProfileComponent } from './profile/profile.component';
import { FriendsComponent } from './friends/friends.component';
import { LabelsComponent } from './labels/labels.component';
import { CsvuploadComponent } from './csvupload/csvupload.component';
import { HomeComponent } from './home/home.component';

import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '',       component: HomeComponent },
  { path: 'login',  component: LoginComponent },
  { path: 'logout',  component: LogoutComponent },
  { path: 'register',  component: RegisterComponent },
  { path: 'summary',  component: SimpleanalysisComponent },
  { path: 'summary/:user',  component: SimpleanalysisComponent },
  { path: 'analyze',  component: AnalysisComponent },
  { path: 'profile',  component: ProfileComponent },
  { path: 'friends',  component: FriendsComponent },
  { path: 'tags',  component: LabelsComponent },
  { path: 'import',  component: CsvuploadComponent },
  { path: 'test',  component: TestComponent },
//  { path: 'signup', component: Signup },
//  { path: 'home',   component: Home, canActivate: [AuthGuard] },
//  { path: '**',     component: Login },
];
