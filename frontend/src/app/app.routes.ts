import { Routes } from '@angular/router';

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
import { MainComponent } from './main/main.component';
import { ProgressComponent } from './progress/progress.component';
import { VideoComponent } from './video/video.component';
import { VideocollectionComponent } from './videocollection/videocollection.component';
import { LandingComponent } from './landing/landing.component';

import { AuthGuard } from './services/auth.guard';



export const routes: Routes = [
  { path: '',       component: MainComponent },
  { path: 'login',  component: LoginComponent },
  { path: 'logout',  component: LogoutComponent, canActivate: [AuthGuard] },
  { path: 'register',  component: RegisterComponent },
  { path: 'summary',  component: SimpleanalysisComponent , canActivate: [AuthGuard]},
  { path: 'summary/:user',  component: SimpleanalysisComponent, canActivate: [AuthGuard] },
  { path: 'analyze',  component: AnalysisComponent, canActivate: [AuthGuard] },
  { path: 'profile',  component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'friends',  component: FriendsComponent, canActivate: [AuthGuard] },
  { path: 'tags',  component: LabelsComponent, canActivate: [AuthGuard] },
  { path: 'import',  component: CsvuploadComponent, canActivate: [AuthGuard] },
  { path: 'test',  component: TestComponent },
  { path: 'progress',  component: ProgressComponent, canActivate: [AuthGuard] },
  { path: 'video',  component: VideoComponent, canActivate: [AuthGuard] },
  { path: 'videocollection',  component: VideocollectionComponent, canActivate: [AuthGuard] },
  { path: 'landing',  component: LandingComponent, canActivate: [AuthGuard] },
//  { path: 'signup', component: Signup },
//  { path: 'home',   component: Home, canActivate: [AuthGuard] },
//  { path: '**',     component: Login },
];
