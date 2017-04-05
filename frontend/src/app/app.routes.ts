import { Routes } from '@angular/router';

import { LoginComponent } from './accounts/login/login.component';
import { RegisterComponent } from './accounts/register/register.component';
import { PasswordresetComponent } from './accounts/passwordreset/passwordreset.component';
import { ForgotpasswordComponent } from './accounts/forgotpassword/forgotpassword.component';
import { VerifyemailComponent } from './accounts/verifyemail/verifyemail.component';
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
import { SummaryComponent } from './summary/summary.component';
import { SuccessComponent } from './customer/success/success.component';
import { CanceledComponent } from './customer/canceled/canceled.component';
import { CartComponent } from './customer/cart/cart.component';
import { AboutComponent } from './footer/about/about.component';
import { TutorialsComponent } from './footer/tutorials/tutorials.component';
import { ContactComponent } from './footer/contact/contact.component';
import { PricingComponent } from './home-anonym/pricing/pricing.component';

import { DummyComponent } from './dummy/dummy.component';

import { AuthGuard } from './services/auth.guard';
import { ImportGuard } from './services/import.guard';
import { CustomerGuard } from './services/customer.guard';

export const routes: Routes = [
  { path: '',       component: MainComponent },
  { path: 'home',       component: HomeComponent, canActivate: [AuthGuard, ImportGuard, CustomerGuard] },
  { path: 'login',  component: LoginComponent },
  //{ path: 'logout',  component: LogoutComponent, canActivate: [AuthGuard] },
  { path: 'register',  component: RegisterComponent },
  { path: 'summary',  component: SummaryComponent, canActivate: [AuthGuard, ImportGuard, CustomerGuard]},
  { path: 'summary/:user',  component: SummaryComponent, canActivate: [AuthGuard, ImportGuard, CustomerGuard]},
  { path: 'analysis',  component: SimpleanalysisComponent, canActivate: [AuthGuard, ImportGuard, CustomerGuard]},
  { path: 'analysis/:user',  component: SimpleanalysisComponent, canActivate: [AuthGuard, ImportGuard, CustomerGuard] },
  { path: 'advanced',  component: AnalysisComponent, canActivate: [AuthGuard, ImportGuard, CustomerGuard] },
  { path: 'profile',  component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'friends',  component: FriendsComponent, canActivate: [AuthGuard] },
  { path: 'tags',  component: LabelsComponent, canActivate: [AuthGuard] },
  { path: 'import',  component: CsvuploadComponent, canActivate: [AuthGuard] },
  //{ path: 'test',  component: TestComponent },
  { path: 'progress',  component: ProgressComponent, canActivate: [AuthGuard, ImportGuard, CustomerGuard] },
  { path: 'progress/:period',  component: ProgressComponent, canActivate: [AuthGuard, ImportGuard, CustomerGuard] },
  { path: 'video',  component: VideoComponent, canActivate: [AuthGuard, ImportGuard, CustomerGuard] },
  { path: 'payment/success',  component: SuccessComponent },
  { path: 'payment/canceled',  component: CanceledComponent },
  { path: 'cart',  component: CartComponent, canActivate: [AuthGuard] },
  { path: 'videocollection',  component: VideocollectionComponent, canActivate: [AuthGuard, ImportGuard, CustomerGuard] },
  { path: 'landing',  component: LandingComponent, canActivate: [AuthGuard] },
  { path: 'resetpassword',  component: ForgotpasswordComponent },
  { path: 'reset/:uid/:token',  component: PasswordresetComponent },
  { path: 'verify-email/:key',  component: VerifyemailComponent },
  { path: '_dummy/:user',  component: DummyComponent },
  { path: 'about',  component: AboutComponent },
  { path: 'tutorials',  component: TutorialsComponent },
  { path: 'contact',  component: ContactComponent },
  { path: 'pricing',  component: PricingComponent },

//  { path: 'signup', component: Signup },
//  { path: 'home',   component: Home, canActivate: [AuthGuard] },
//  { path: '**',     component: Login },
];
