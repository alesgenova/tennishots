import { Component, OnInit } from '@angular/core';

import { TennistatService } from '../services/tennistat.service';
import { ProfileService } from '../services/profile.service';
import { NavigationService } from '../services/navigation.service';

import { SonyFilter, SOFilters, PeriodsPicker, DateRange, NumberRange } from '../objects/sonyfilter';
import { Period, UserPeriodsList } from '../objects/period';
import { UserProfile } from '../objects/registration';
import { SonyResponse } from '../objects/sonyresponse';
import { Label } from '../objects/label';

import {NgbTabChangeEvent} from '@ng-bootstrap/ng-bootstrap';

import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.css']
})
export class AnalysisComponent implements OnInit {

  myUsername: string;
  userProfile: UserProfile;
  userChoices: any[];
  showFilter: boolean = true;
  filter1: SonyFilter = new SonyFilter();
  filter2: SonyFilter = new SonyFilter();
  stats1: SonyResponse = new SonyResponse();
  stats2: SonyResponse = new SonyResponse();
  gotPeriods1 = true;
  gotPeriods2 = true;
  //_filter2: SonyFilter = new SonyFilter(); // aux filter to save/delete the state of filter2 when enabling/disabling comparison

  //filter2: SonyFilter;
  compare: boolean = false;
  comparebtntext: string = "+";

  //
  listOfPeriods1: UserPeriodsList = new UserPeriodsList();
  listOfPeriods2: UserPeriodsList = new UserPeriodsList();
  tagList1: Label[] = [];
  tagList2: Label[] = [];

  imperial_units: boolean = false;

  playerProfilesSubscription: Subscription;
  userChoicesSubscription: Subscription;
  userProfileSubscription: Subscription;
  playerProfiles: any;

  constructor(private tennistatService: TennistatService,
              private profileService: ProfileService,
              private navigationService: NavigationService) { }

  ngOnInit() {
      this.navigationService.setActiveSection("analysis");
      this.myUsername = this.profileService.getUsername();
      this.filter1.username = this.myUsername;
      this.filter2.username = this.myUsername;

      this.userProfileSubscription = this.profileService.userProfile$
        .subscribe(profile => {
            this.userProfile = profile;
            this.imperial_units = (this.userProfile.units == 'M');
            this.filter1.imperial_units = this.imperial_units;
            this.filter2.imperial_units = this.imperial_units;
        });

      // subscribe to changes in the player profiles
      this.playerProfilesSubscription = this.profileService.playerProfiles$
        .subscribe(profiles => {
          this.playerProfiles = profiles;
          this.populatePeriods(1);
          this.populatePeriods(2);
          //this.fromProfileToPagination();
        });

      // subscribe to changes in the user choices
      this.userChoicesSubscription = this.profileService.userChoices$
        .subscribe(choices => {
          this.userChoices = choices;
          //console.log("userChoices");
          //console.log(this.userChoices);
        });

//      this.onUserSelectClick(1);
//      this.onUserSelectClick(2);
  }

  ngOnDestroy() {
    // prevent memory leak when component is destroyed
    this.playerProfilesSubscription.unsubscribe();
    this.userChoicesSubscription.unsubscribe();
    this.userProfileSubscription.unsubscribe();
  }

  handleCompareChange() {
      if (!this.compare){
        this.comparebtntext = "-";
      }else{
        this.comparebtntext = "+";
      }
      this.compare = ! this.compare;
  }

  beforeTabChange($event: NgbTabChangeEvent) {
      this.showFilter = true;
      if ($event.nextId === 'tabS') {
        $event.preventDefault();
      }
    };

    onUserChange(user:string, num:number){
        this.showFilter = true;
        if (num == 1){
            this.filter1 = new SonyFilter();
            //this.gotPeriods1 = false;
            this.filter1.username = user;
            this.filter1.imperial_units = this.imperial_units;
        }else if (num == 2){
            this.filter2 = new SonyFilter();
            //this.gotPeriods2 = false;
            this.filter2.username = user;
            this.filter2.imperial_units = this.imperial_units;
        }
        this.populatePeriods(num);
    }

    populatePeriods(num:number){
        if (num ==1){
            //this.gotPeriods1 = false;
            let activePlayer = this.playerProfiles[this.filter1.username];
            this.listOfPeriods1 = activePlayer.periods;
            this.tagList1 = activePlayer.labels;
            //this.gotPeriods1 = true;
        }else if (num == 2){
            //this.gotPeriods2 = false;
            let activePlayer = this.playerProfiles[this.filter2.username];
            this.listOfPeriods2 = activePlayer.periods;
            this.tagList2 = activePlayer.labels;
            //this.gotPeriods2 = true;
        }
    }

  onSubmitRequest(){
      this.stats1 = new SonyResponse();
      this.stats2 = new SonyResponse();
      this.tennistatService.get_filter_stats(this.filter1)
        .subscribe(data=>{
            this.stats1 = data;
        });
      if (this.compare){
          this.tennistatService.get_filter_stats(this.filter2)
            .subscribe(data=>{
                this.stats2 = data;
            });
      }
      this.showFilter = false;
  }

}
