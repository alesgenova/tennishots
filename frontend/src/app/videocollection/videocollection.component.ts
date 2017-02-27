import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormControl, FormBuilder, FormGroup, Validators }  from '@angular/forms';

import { ProfileService } from '../services/profile.service';
import { TennistatService } from '../services/tennistat.service';

import { SonyFilter, SOFilters, PeriodsPicker, DateRange, NumberRange } from '../objects/sonyfilter';
import { Period, UserPeriodsList } from '../objects/period';
import { Label } from '../objects/label';

import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-videocollection',
  templateUrl: './videocollection.component.html',
  styleUrls: ['./videocollection.component.css']
})
export class VideocollectionComponent implements OnInit {

    userChoices: any;
    userChoices_keys:any[];
    activeUser: string;
    previousUser: string = '';
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

    listOfPeriods = new UserPeriodsList();
    tagList: Label[] = [];
    filter: SonyFilter = new SonyFilter();

    filterCount: number;
    videoCollectionForm: FormGroup;

  constructor(  private route: ActivatedRoute,
                private router: Router,
                private fb: FormBuilder,
                private profileService: ProfileService,
                private tennistatService: TennistatService ) { }

  ngOnInit() {
      this.timezoneString = this.profileService.getTimezoneString();

      this.userProfile = this.profileService.getProfile();
      this.activeUser = this.route.snapshot.params['user'];
      if (this.activeUser == null){
          this.activeUser = this.userProfile.user;
      }
      if (this.activeUser == this.userProfile.user){

      }else{
          if (this.userProfile.friends.some(x=>x.user==this.activeUser)){
          }else{
              this.router.navigate(['videocollection']);
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
      this.onUserSelectClick();
      let activePlayer = this.profileService.getPlayerProfile(this.userProfile.user);
      this.listOfPeriods = activePlayer.periods;
      this.tagList = activePlayer.labels;
      this.filter.username = this.userProfile.user;

      this.createVideoCollectionForm();
  }

  onUserSelectClick() {
      if (!(this.activeUser == this.previousUser)){
          this.videoList = [];
          this.getUserVideoCollections(this.activeUser);
          this.previousUser = this.activeUser;
          if (this.doCreate){
            if (this.activeUser != this.userProfile.user){
                this.doCreate = false;
            }
          }

      }
  }

  getUserVideoCollections(user:string) {
      this.tennistatService.get_videocollections(user)
        .subscribe(data=>{
            this.videoList = data;
            this.onVideoPagination();
        });
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
      this.activeUser = this.userProfile.user;
      this.previousUser = this.activeUser;
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
                this.previousUser = '';
                this.onUserSelectClick();
                this.doCreate = false;
                this.filter = new SonyFilter();
                this.filter.username = this.userProfile.user;
            });
  }

}
