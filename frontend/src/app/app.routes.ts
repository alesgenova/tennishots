import { Routes } from '@angular/router';

import { TestComponent } from './test/test.component';
import { LoginComponent } from './accounts/login/login.component';
import { LogoutComponent } from './accounts/logout/logout.component';
import { RegisterComponent } from './accounts/register/register.component';
import { PasswordresetComponent } from './accounts/passwordreset/passwordreset.component';
import { ForgotpasswordComponent } from './accounts/forgotpassword/forgotpassword.component';
import { AnalysisComponent } from './analysis/analysis.component';
import { SimpleanalysisComponent } from './simpleanalysis/simpleanalysis.component';
import { ProfileComponent } from './accounts/profile/profile.component';
import { FriendsComponent } from './friends/friends.component';
import { LabelsComponent } from './labels/labels.component';
import { CsvuploadComponent } from './csvupload/csvupload.component';
import { HomeComponent } from './home/home.component';
import { MainComponent } from './main/main.component';
import { ProgressComponent } from './progress/progress.component';
import { VideoComponent } from './video/video.component';
import { VideocollectionComponent } from './videocollection/videocollection.component';
import { LandingComponent } from './landing/landing.component';

import { AuthGuard } from './services/auth.guard';
import { ImportGuard } from './services/import.guard';
//import { PaidGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '',       component: MainComponent },
  { path: 'home',       component: HomeComponent, canActivate: [AuthGuard, ImportGuard] },
  { path: 'login',  component: LoginComponent },
  { path: 'logout',  component: LogoutComponent, canActivate: [AuthGuard] },
  { path: 'register',  component: RegisterComponent },
  { path: 'summary',  component: SimpleanalysisComponent, canActivate: [AuthGuard, ImportGuard]},
  { path: 'summary/:user',  component: SimpleanalysisComponent, canActivate: [AuthGuard, ImportGuard] },
  { path: 'analyze',  component: AnalysisComponent, canActivate: [AuthGuard, ImportGuard] },
  { path: 'profile',  component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'friends',  component: FriendsComponent, canActivate: [AuthGuard] },
  { path: 'tags',  component: LabelsComponent, canActivate: [AuthGuard] },
  { path: 'import',  component: CsvuploadComponent, canActivate: [AuthGuard] },
  { path: 'test',  component: TestComponent },
  { path: 'progress',  component: ProgressComponent, canActivate: [AuthGuard, ImportGuard] },
  { path: 'video',  component: VideoComponent, canActivate: [AuthGuard, ImportGuard] },
  { path: 'videocollection',  component: VideocollectionComponent, canActivate: [AuthGuard, ImportGuard] },
  { path: 'landing',  component: LandingComponent, canActivate: [AuthGuard] },
  { path: 'resetpassword',  component: ForgotpasswordComponent },
  { path: 'reset/:uid/:token',  component: PasswordresetComponent },
//  { path: 'signup', component: Signup },
//  { path: 'home',   component: Home, canActivate: [AuthGuard] },
//  { path: '**',     component: Login },
];
