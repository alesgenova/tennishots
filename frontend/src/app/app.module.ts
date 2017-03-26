import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule, XSRFStrategy, CookieXSRFStrategy } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

//While the fix angular2-jtw import extra stuff
//import { AUTH_PROVIDERS } from 'angular2-jwt';
import { Http, RequestOptions } from '@angular/http';
import { provideAuth, AuthHttp, AuthConfig } from 'angular2-jwt';

import { AuthService } from './services/auth.service';
import { AuthGuard } from './services/auth.guard';
import { ImportGuard } from './services/import.guard';
import { CustomerGuard } from './services/customer.guard';

import { NavigationService } from './services/navigation.service';
import { TennistatService } from './services/tennistat.service';
import { ProfileService } from './services/profile.service';

import { LoopObjectPipe } from './pipes/loopobject.pipe'

// highcharts module
//import { ChartModule } from 'angular2-highcharts';
import { ChartsModule } from 'ng2-charts';

import { routes } from './app.routes';
import { AppComponent } from './app.component';
import { LoginComponent } from './accounts/login/login.component';
import { AnalysisComponent } from './analysis/analysis.component';
import { FilterComponent } from './analysis/filter/filter.component';

// file uploader
//import { FileSelectDirective, FileDropDirective } from 'ng2-file-upload';
import {FileUploadModule} from 'primeng/primeng';

// ng2-bootstrap components
//import { TabsModule } from 'ng2-bootstrap/tabs';
//import { AlertModule } from 'ng2-bootstrap';
// ng-bootstrap
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

//import { NouisliderComponent } from 'ng2-nouislider';
import { NouisliderModule } from 'ng2-nouislider';
//font-awesome
//import { Angular2FontawesomeModule } from 'angular2-fontawesome/angular2-fontawesome'

import { PeriodlistComponent } from './analysis/periodlist/periodlist.component';
import { DisplayComponent } from './analysis/display/display.component';
import { TopbarComponent } from './topbar/topbar.component';
import { RegisterComponent } from './accounts/register/register.component';
import { FriendsComponent } from './friends/friends.component';
import { LabelsComponent } from './labels/labels.component';
import { ProfileComponent } from './accounts/profile/profile.component';
import { CsvuploadComponent } from './csvupload/csvupload.component';
import { HomeComponent } from './home/home.component';
import { SimpleanalysisComponent } from './simpleanalysis/simpleanalysis.component';
import { TaglistComponent } from './analysis/taglist/taglist.component';
import { ProgressComponent } from './progress/progress.component';
import { BoxplotComponent } from './boxplot/boxplot.component';
import { MainComponent } from './main/main.component';
import { HomeAnonymComponent } from './home-anonym/home-anonym.component';
import { FooterComponent } from './footer/footer.component';
import { VideoComponent } from './video/video.component';
import { VideocollectionComponent } from './videocollection/videocollection.component';
import { StrokelistComponent } from './analysis/strokelist/strokelist.component';
import { LandingComponent } from './landing/landing.component';
import { PasswordresetComponent } from './accounts/passwordreset/passwordreset.component';
import { ForgotpasswordComponent } from './accounts/forgotpassword/forgotpassword.component';
import { VerifyemailComponent } from './accounts/verifyemail/verifyemail.component';
import { SummaryComponent } from './summary/summary.component';
import { DummyComponent } from './dummy/dummy.component';
import { CartComponent } from './customer/cart/cart.component';
import { SuccessComponent } from './customer/success/success.component';
import { CanceledComponent } from './customer/canceled/canceled.component';
import { AboutComponent } from './footer/about/about.component';
import { TutorialsComponent } from './footer/tutorials/tutorials.component';
import { ContactComponent } from './footer/contact/contact.component';
import { PricingComponent } from './home-anonym/pricing/pricing.component';

export function authHttpServiceFactory(http: Http, options: RequestOptions) {
  return new AuthHttp( new AuthConfig({'headerPrefix':'JWT'}), http, options);
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AnalysisComponent,
    FilterComponent,
    //NouisliderComponent,
    PeriodlistComponent,
    DisplayComponent,
    TopbarComponent,
    RegisterComponent,
    FriendsComponent,
    LabelsComponent,
    ProfileComponent,
    // ng2-file-upload
    //FileSelectDirective,
    //FileDropDirective,
    CsvuploadComponent,
    HomeComponent,
    SimpleanalysisComponent,
    TaglistComponent,
    ProgressComponent,
    BoxplotComponent,
    MainComponent,
    HomeAnonymComponent,
    FooterComponent,
    VideoComponent,
    VideocollectionComponent,
    StrokelistComponent,
    LandingComponent,
    PasswordresetComponent,
    ForgotpasswordComponent,
    VerifyemailComponent,
    LoopObjectPipe,
    SummaryComponent,
    DummyComponent,
    CartComponent,
    SuccessComponent,
    CanceledComponent,
    AboutComponent,
    TutorialsComponent,
    ContactComponent,
    PricingComponent
  ],
  imports: [
    RouterModule.forRoot(routes),
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    //bootstrap
    NgbModule.forRoot(),
    NouisliderModule,
    //highcharts
    //ChartModule,
    ChartsModule,
    //font-awesome
    //Angular2FontawesomeModule,
    FileUploadModule
  ],
  providers: [AuthService, NavigationService,
              TennistatService, ProfileService,
              AuthGuard, ImportGuard,
              CustomerGuard,
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
