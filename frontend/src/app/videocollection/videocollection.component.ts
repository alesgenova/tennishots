import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormControl, FormBuilder, FormGroup, Validators }  from '@angular/forms';

import { ProfileService } from '../services/profile.service';
import { TennistatService } from '../services/tennistat.service';
import { NavigationService } from '../services/navigation.service';

import { SonyFilter, SOFilters, PeriodsPicker, DateRange, NumberRange } from '../objects/sonyfilter';
import { Period, UserPeriodsList } from '../objects/period';
import { Label } from '../objects/label';

import {Subscription} from 'rxjs/Subscription';

import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-videocollection',
  templateUrl: './videocollection.component.html',
  styleUrls: ['./videocollection.component.css']
})
export class VideocollectionComponent implements OnInit {

    userChoices: any;
    myUsername: string;
    activeUser: string;
    requestedUser: string;
    userProfile: any;
    videosPerPage = 4;
    doVideoPagination: boolean;
    nVideos: number;
    currPageVideo: number;
    videoList: any[] = [];
    videoSubset: any[] = [];
    activeVideo: any;
    activeVideoPk: number = 0;
    timezoneString: string = "";
    doCreate = false;

    imperial_units: boolean = false;

    listOfPeriods = new UserPeriodsList();
    tagList: Label[] = [];
    filter: SonyFilter = new SonyFilter();

    filterCount: number;
    videoCollectionForm: FormGroup;

    playerProfilesSubscription: Subscription;
    userChoicesSubscription: Subscription;
    playerProfiles: any;
    userProfileSubscription: Subscription;

  constructor(  private route: ActivatedRoute,
                private router: Router,
                private fb: FormBuilder,
                private profileService: ProfileService,
                private tennistatService: TennistatService,
                private navigationService: NavigationService) { }

  ngOnInit() {
      this.navigationService.setActiveSection("video");
      this.timezoneString = this.profileService.getTimezoneString();
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
                }
            }else{
                this.activeUser = this.myUsername;
            }
            this.imperial_units = (this.userProfile.units == 'M');
            this.filter.username = this.userProfile.user;
            this.filter.imperial_units = this.imperial_units;
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

      this.createVideoCollectionForm();
  }

  ngOnDestroy() {
    // prevent memory leak when component is destroyed
    this.playerProfilesSubscription.unsubscribe();
    this.userChoicesSubscription.unsubscribe();
    this.userProfileSubscription.unsubscribe();
  }

  onUserChange(user:string) {
      this.activeUser = user;
      this.videoList = [];
      this.fromProfileToPagination();
      if (this.doCreate){
        if (this.activeUser != this.myUsername){
            this.doCreate = false;
        }
      }
  }

  fromProfileToPagination() {
      let activePlayer = this.playerProfiles[this.activeUser];
      this.listOfPeriods = activePlayer.periods;
      this.tagList = activePlayer.labels;
      this.videoList = activePlayer.collections;
      this.onVideoPagination();
  }

  onVideoPagination(){
      this.nVideos = this.videoList.length;
      this.doVideoPagination = (this.nVideos > this.videosPerPage);
      this.currPageVideo = 1;
      if (this.doVideoPagination){
          this.videoSubset = this.videoList.slice(0,this.videosPerPage);
      }else{
          this.videoSubset = this.videoList;
      }
  }

  onVideoPageChange(){
      var start: number;
      var stop: number;
      start = (this.currPageVideo-1)*this.videosPerPage;
      stop = start+this.videosPerPage;
      this.videoSubset = this.videoList.slice(start,stop);
  }

  onVideoSelect(video:any){
      this.activeVideo = null;
      this.activeVideo = video;
      this.activeVideoPk = video.pk;
  }

  onRetry(pk: number){
      this.tennistatService.process_video("VideoCollection", pk)
            .subscribe( res => {});
      this.activeVideo.status = "P";
  }

  onCreateSwitch(){
      this.doCreate = true;
      if (this.activeUser != this.userProfile.user){
        //this.activeUser = this.userProfile.user;
        this.onUserChange(this.userProfile.user);
      }

  }

  onFilter(){
      this.tennistatService.get_shot_count(this.filter)
            .subscribe( res => {
                this.filterCount = res.shot_count;
            });
  }

  createVideoCollectionForm(){
      this.videoCollectionForm = this.fb.group({
          title: ['', Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(20)])],
          description: ['', Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(200)])]
      });
  }

  onCreateVideo(){
      let title = this.videoCollectionForm.value['title'];
      let description = this.videoCollectionForm.value['description'];
      this.tennistatService.create_videocollection(this.filter, title, description)
            .subscribe( res => {
                this.activeVideo = res;
                this.activeVideoPk = res.pk;
                //this.profileService.checkLastChanges();
                this.fromProfileToPagination();
                this.doCreate = false;
                this.filter = new SonyFilter();
                this.filter.username = this.userProfile.user;
                this.filter.imperial_units = this.imperial_units;
            });
  }

}
