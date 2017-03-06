import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { ProfileService } from '../services/profile.service';
import { TennistatService } from '../services/tennistat.service';
import { NavigationService } from '../services/navigation.service';

import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit {
    userChoices: any;
    myUsername: string;
    activeUser: string;
    requestedUser: string;
    userProfile: any;
    userChoicesSubscription: Subscription;
    playerProfiles: any;
    playerProfilesSubscription: Subscription;
    playerSummaries: any;
    playerSummariesSubscription: Subscription;
    userProfileSubscription: Subscription;

  constructor(private route: ActivatedRoute,
                private router: Router,
                private profileService: ProfileService,
                private tennistatService: TennistatService,
                private navigationService: NavigationService) { }

  ngOnInit() {
      this.navigationService.setActiveSection("summary");
      this.myUsername = this.profileService.getUsername();
      this.requestedUser = this.route.snapshot.params['user'];

      this.userProfileSubscription = this.profileService.userProfile$
        .subscribe(profile => {
            this.userProfile = profile;
            if (this.requestedUser == null){
                this.activeUser = this.myUsername;
            }
            if (this.requestedUser != this.myUsername){
                if (this.userProfile.friends.some(x=>x.user==this.requestedUser)){
                    this.activeUser = this.requestedUser;
                }else{
                    this.activeUser = this.myUsername;
                }
            }
        });

      // subscribe to changes in the player profiles
      this.playerProfilesSubscription = this.profileService.playerProfiles$
        .subscribe(profiles => {
          this.playerProfiles = profiles;
        });

      // subscribe to changes in the user choices
      this.userChoicesSubscription = this.profileService.userChoices$
        .subscribe(choices => {
          this.userChoices = choices;
        });

      // subscribe to changes in the user choices
      this.playerSummariesSubscription = this.profileService.playerSummaries$
        .subscribe(summaries => {
          this.playerSummaries = summaries;
      });

  }

  ngOnDestroy() {
    // prevent memory leak when component is destroyed
    this.playerProfilesSubscription.unsubscribe();
    this.playerSummariesSubscription.unsubscribe();
    this.userChoicesSubscription.unsubscribe();
    this.userProfileSubscription.unsubscribe();
  }

}
