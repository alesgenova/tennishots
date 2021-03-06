import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { ProfileService } from '../services/profile.service';
import { TennistatService } from '../services/tennistat.service';
import { NavigationService } from '../services/navigation.service';

import { Period, UserPeriodsList } from '../objects/period';
import { Label } from '../objects/label';
import { SONY_STROKES_CHOICES } from '../objects/strokes';
import { PERIOD_CHOICES } from '../objects/period';

import {Subscription} from 'rxjs/Subscription';

import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})
export class ProgressComponent implements OnInit {

    userChoices: any;
    userChoicesSubscription: Subscription;
    activeUser: string;
    activePeriod: string = 'session';
    activeSwing: string = 'FH';
    previousUser: string = '';
    previousPeriod: string = '';
    previousSwing: string = '';
    //userProfile: any;
    //userProfileSubscription: Subscription;
    plots: any[] = [];
    SONY_STROKES_CHOICES = SONY_STROKES_CHOICES;
    PERIOD_CHOICES = PERIOD_CHOICES;

  constructor(  private route: ActivatedRoute,
                private router: Router,
                private profileService: ProfileService,
                private tennistatService: TennistatService,
                private navigationService: NavigationService) { }

  ngOnInit() {
      this.navigationService.setActiveSection("progress");
      //this.userProfile = this.profileService.getProfile();
      this.activeUser = this.profileService.getUsername();
      this.activePeriod = this.route.snapshot.params['period'];
      if (this.activePeriod == null){
          this.activePeriod = "session";
      }
      if (this.activePeriod == "session" || this.activePeriod == "week" || this.activePeriod == "month" || this.activePeriod == "year"){

      }else{
          this.activePeriod = "session";
          //this.router.navigate(['progress']);
      }
      // subscribe to changes in the user choices
      this.userChoicesSubscription = this.profileService.userChoices$
        .subscribe(choices => {
          this.userChoices = choices;
          //console.log("userChoices");
          //console.log(this.userChoices);
        });
        
      this.get_progress_plots();

  }

  ngOnDestroy() {
    this.userChoicesSubscription.unsubscribe();
  }

  onUserChange(user:string){
      this.activeUser = user;
      this.get_progress_plots();
  }

  onPeriodChange(period:string){
      this.activePeriod = period;
      this.get_progress_plots();
  }

  onSwingChange(swing:string){
      this.activeSwing = swing;
      this.get_progress_plots();
  }

  get_progress_plots(){
      this.tennistatService.get_progress(this.activeUser, this.activePeriod, this.activeSwing)
            .subscribe( res => {
                this.plots = []
                this.plots.push({label:"Swing speed", img:res.swing_speed});
                this.plots.push({label:"Ball speed", img:res.ball_speed});
                this.plots.push({label:"Ball spin", img:res.ball_spin});
            });
  }
}
