import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { ProfileService } from '../services/profile.service';
import { TennistatService } from '../services/tennistat.service';

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
    userProfile: any;
    plots: any[];
    SONY_STROKES_CHOICES = SONY_STROKES_CHOICES;
    PERIOD_CHOICES = PERIOD_CHOICES;

  constructor(  private route: ActivatedRoute,
                private router: Router,
                private profileService: ProfileService,
                private tennistatService: TennistatService) { }

  ngOnInit() {
      this.userProfile = this.profileService.getProfile();
      this.activeUser = this.route.snapshot.params['user'];
      if (this.activeUser == null){
          this.activeUser = this.userProfile.user;
      }
      if (this.activeUser == this.userProfile.user){

      }else{
          if (this.userProfile.friends.some(x=>x.user==this.activeUser)){
          }else{
              this.router.navigate(['progress']);
          }
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
      console.log("getting_plots");
      this.tennistatService.get_progress(this.activeUser, this.activePeriod, this.activeSwing)
            .subscribe( res => {
                this.plots = []
                this.plots.push({label:"Swing speed", img:res.swing_speed});
                this.plots.push({label:"Ball speed", img:res.ball_speed});
                this.plots.push({label:"Ball spin", img:res.ball_spin});
            });
  }
}
