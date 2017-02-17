import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { ProfileService } from '../services/profile.service';
import { TennistatService } from '../services/tennistat.service';

import { Period, UserPeriodsList } from '../objects/period';
import { Label } from '../objects/label';
import { SONY_STROKES_CHOICES } from '../objects/strokes';
import { PERIOD_CHOICES } from '../objects/period';

import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})
export class ProgressComponent implements OnInit {

    userChoices: any;
    userChoices_keys:any[];
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
      this.userChoices = {};
      this.userChoices_keys = []; // I ain't implementing no fucking pipe to loop in the template. I miss python.
      this.userChoices_keys.push(this.userProfile.user);
      this.userChoices[this.userProfile.user] = {username:this.userProfile.user,
                             first_name:"Myself",
                             last_name:"",
                             avatar:this.userProfile.avatar};
      for (let friend of this.userProfile.friends){
          this.userChoices_keys.push(friend.user);
          this.userChoices[friend.user] = {username:friend.user,
                                 first_name:friend.first_name,
                                 last_name:friend.last_name,
                                 avatar:friend.avatar};
      };
      this.onSelectClick();
  }

  onSelectClick() {
      if (!(this.activeUser == this.previousUser) ||
            !(this.activePeriod == this.previousPeriod) ||
            !(this.activeSwing == this.previousSwing)){
          this.get_progress_plots()
          this.previousUser = this.activeUser;
          this.previousPeriod = this.activePeriod;
          this.previousSwing = this.activeSwing;
      }
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
