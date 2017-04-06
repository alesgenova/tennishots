import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { ProfileService } from '../services/profile.service';
import { TennistatService } from '../services/tennistat.service';
import { NavigationService } from '../services/navigation.service';

import { SonyFilter, SOFilters, PeriodsPicker, DateRange, NumberRange } from '../objects/sonyfilter';
import { Period, UserPeriodsList } from '../objects/period';
import { SonyResponse } from '../objects/sonyresponse';
import { Label } from '../objects/label';

import {Subscription} from 'rxjs/Subscription';

import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-simpleanalysis',
  templateUrl: './simpleanalysis.component.html',
  styleUrls: ['./simpleanalysis.component.css']
})
export class SimpleanalysisComponent implements OnInit {

    userChoices: any;
    myUsername: string;
    stats = new SonyResponse();
    listOfPeriods = new UserPeriodsList();
    activeUser: string;
    requestedUser: string;
    activePk: number = -1;
    activePeriod: string = 'session';
    previousUser: string = '';
    userProfile: any;
    doPagination: boolean;
    nPeriods: number;
    periodsPerPage: number = 4;
    currPage: number = 1;
    filteredPeriods: Period[];
    periodsSubset: Period[];
    tagList: Label[] = [];
    selectedTags: number[] = [];

    isActive = {
      session:false
    }

    playerProfilesSubscription: Subscription;
    userChoicesSubscription: Subscription;
    playerProfiles: any;
    userProfileSubscription: Subscription;

  constructor(  private route: ActivatedRoute,
                private router: Router,
                private profileService: ProfileService,
                private tennistatService: TennistatService,
                private navigationService: NavigationService) { }

  ngOnInit() {
      this.navigationService.setActiveSection("analysis");
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
          this.fromProfileToPagination();
        });

      // subscribe to changes in the user choices
      this.userChoicesSubscription = this.profileService.userChoices$
        .subscribe(choices => {
          this.userChoices = choices;
          //console.log("userChoices");
          //console.log(this.userChoices);
        });
  }

  ngOnDestroy() {
    // prevent memory leak when component is destroyed
    this.playerProfilesSubscription.unsubscribe();
    this.userChoicesSubscription.unsubscribe();
    this.userProfileSubscription.unsubscribe();
  }

  onUserChange(user:string){
    this.activeUser = user;
    this.activePk = -1;
    this.currPage = 1;
    this.selectedTags = [];
    this.stats = new SonyResponse();
    this.fromProfileToPagination();
    //if (this.activePeriod == 'all'){
    //    this.onPeriodSelect(0);
    //}
  }

  fromProfileToPagination() {
      let activePlayer = this.playerProfiles[this.activeUser];
      this.listOfPeriods = activePlayer.periods;
      this.tagList = activePlayer.labels;
      this.onPeriodChange(this.activePeriod);
      //this.previousUser = this.activeUser;
  }

  onPeriodChange(name:string){
      this.activePeriod = name;
      this.selectedTags = [];
      if (name == 'all'){
          this.periodsSubset = [];
          this.onPeriodSelect(0);
          this.doPagination = false;
      }else{
          this.nPeriods = this.listOfPeriods[name].length;
          this.doPagination = (this.nPeriods > this.periodsPerPage);
          this.filteredPeriods = this.listOfPeriods[name]
          //this.currPage = 1;
          if (this.doPagination){
              this.onPageChange();
          }else{
              this.periodsSubset = this.filteredPeriods
          }
      }
  }

  onPageChange(){
      var start: number;
      var stop: number;
      start = (this.currPage-1)*this.periodsPerPage;
      stop = start+this.periodsPerPage;
      //this.periodsSubset = this.listOfPeriods[this.activePeriod].slice(start,stop);
      this.periodsSubset = this.filteredPeriods.slice(start,stop);
  }

  getFormattedTag(name:string, category:number){
      if (category == null){
          return name;
      }else if (category == 0){
          return '<span class="badge badge-primary">'+name+'</span>';
      }else if (category == 1){
          return '<span class="badge badge-success">'+name+'</span>';
      }else if (category == 2){
          return '<span class="badge badge-info">'+name+'</span>';
      }else if (category == 3){
          return '<span class="badge badge-warning">'+name+'</span>';
      }else if (category == 4){
          return '<span class="badge badge-danger">'+name+'</span>';
      }else if (category == 5){
          return '<span class="badge badge-default">'+name+'</span>';
      }
  }

  onPeriodSelect(pk:number){
      if (!(pk==this.activePk)){
          let filter = new SonyFilter();
          filter.username = this.activeUser;
          let imperial_units = (this.userProfile.units == 'M');
          filter.imperial_units = imperial_units;
          if (pk==0){
              filter.filters.periods.name = "session"; // doesn't matter, we're taking all shots
              filter.filters.periods.pks = [];
          }else{
              filter.filters.periods.name = this.activePeriod;
              filter.filters.periods.pks = [pk];
          }
          this.activePk = pk;
          //this.stats = new SonyResponse();
          this.tennistatService.get_filter_stats(filter)
            .subscribe(data=>{
                this.stats = data;
            });
      }
  }

  getTagClass(category:number){
      if (category == 0){
          return 'badge-primary'
      }else if (category == 1){
          return 'badge-success'
      }else if (category == 2){
          return 'badge-info'
      }else if (category == 3){
          return 'badge-warning'
      }else if (category == 4){
          return 'badge-danger'
      }else if (category == 5){
          return 'badge-default'
      }
  }

  addPkToPks(pk:number) {
      if (this.selectedTags.some(x=>x==pk)) {
          var idx = this.selectedTags.indexOf(pk);
          this.selectedTags.splice(idx,1);
      }else {
          this.selectedTags.push(pk);
      }
      if (this.selectedTags.length == 0){
          this.filteredPeriods = this.listOfPeriods['session']
      }else{
          this.filteredPeriods = [];
          for (let session of this.listOfPeriods['session']){
              let flag = 0
              for (let tagPk of this.selectedTags){
                  for (let sessionTag of session.labels){
                      if (sessionTag.pk == tagPk){
                          flag = flag + 1;
                      }
                  }
              }
              if (flag == this.selectedTags.length){
                  this.filteredPeriods.push(session);
              }
          }
      }
      this.nPeriods = this.filteredPeriods.length;
      this.doPagination = (this.nPeriods > this.periodsPerPage);
      this.currPage = 1;
      if (this.doPagination){
          this.periodsSubset = this.filteredPeriods.slice(0,this.periodsPerPage);
      }else{
          this.periodsSubset = this.filteredPeriods
      }
      //console.log(pk);
  }

  getCheckClass(pk:number) {
      //console.log("checking is in "+pk);
      if (this.selectedTags.some(x=>x==pk)) {
          return 'fa-check-square';
      }else {
          return 'fa-square';
      }
  }
}
