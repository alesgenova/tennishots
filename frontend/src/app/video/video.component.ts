import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { ProfileService } from '../services/profile.service';
import { TennistatService } from '../services/tennistat.service';
import { NavigationService } from '../services/navigation.service';

import { SonyFilter, SOFilters, PeriodsPicker, DateRange, NumberRange } from '../objects/sonyfilter';
import { Period } from '../objects/period';
import { Label } from '../objects/label';

import {Subscription} from 'rxjs/Subscription';

import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit {

    userChoices: any;
    myUsername: string;
    requestedUser: string;
    activeUser: string;
    activeSession = new Period();
    previousUser: string = '';
    userProfile: any;
    userProfileSubscription: Subscription;
    doSessionPagination: boolean;
    nPeriods: number;
    periodsPerPage: number = 4;
    videosPerPage: number = 8;
    currPageSession: number;
    doVideoPagination: boolean;
    nVideos: number;
    currPageVideo: number;
    videoSubset: any[] = [];
    videoList: any[] = [];
    sessionList: Period[];
    filteredSession: Period[];
    periodsSubset: Period[];
    tagList: Label[] = [];
    selectedTags: number[] = [];
    activeVideo: any = null;
    activeVideoPk: number = 0;
    uploadSourceUrl: string;
    timezoneString: string = "";
    fileUploadError = "";

    grouBySession: boolean = false;
    uploadedOnly: boolean = false;
    missingOnly: boolean = false;

    playerProfilesSubscription: Subscription;
    userChoicesSubscription: Subscription;
    playerProfiles: any;

    @ViewChild('videoPlayer') videoPlayer;

  constructor(  private route: ActivatedRoute,
                private router: Router,
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
    this.activeVideo = null;
    this.activeVideoPk = 0;
    this.videoSubset = [];
    this.doVideoPagination = false;
    this.videoSubset = [];
    this.selectedTags = [];
    this.fromProfileToPagination();
  }

  fromProfileToPagination() {
      let activePlayer = this.playerProfiles[this.activeUser];
      this.tagList = activePlayer.labels;
      this.selectedTags = [];
      if (this.grouBySession){
        this.getUserSessionsVideos(activePlayer.periods.session);
      }else{
        this.getUserSessionsVideos(activePlayer.periods.session);
        this.getUserVideos(activePlayer.periods.session);
    }
  }

  onBySessionToggle(){
      this.grouBySession = !this.grouBySession;
      if (this.grouBySession){
          this.videosPerPage = 4;
      }else{
          this.videosPerPage = 8;
      }
      this.fromProfileToPagination();
  }

  onUploadedToggle(){
      this.uploadedOnly = !this.uploadedOnly;
      if (this.uploadedOnly){
        this.missingOnly = false;
      }
      this.fromProfileToPagination();
  }

  onMissingToggle(){
      this.missingOnly = !this.missingOnly;
      if (this.missingOnly){
        this.uploadedOnly = false;
      }
      this.fromProfileToPagination();
  }

  getUserVideos(sessions:Period[]){
      this.videoList = [];
      for (let session of sessions){
          if (session.video_count > 0){
              for (let video of session.videos){
                  if (!this.uploadedOnly && !this.missingOnly){
                      this.videoList.push(video);
                  }else if (this.uploadedOnly){
                      if (video.status == "C" || video.status == "P" || video.status == "F"){
                          this.videoList.push(video);
                      }
                  }else if (this.missingOnly){
                      if (video.status == "U"){
                          this.videoList.push(video);
                      }
                  }
              }
          }
      }
      this.onVideoPagination();
  }

  getUserSessionsVideos(sessions:Period[]) {
      this.sessionList = [];
      for (let session of sessions){
          if (session.video_count > 0){
              if (!this.uploadedOnly && !this.missingOnly){
                  this.sessionList.push(session);
              }else if (this.uploadedOnly){
                  let count = 0;
                  for (let video of session.videos){
                      if (video.status == "C" || video.status == "P" || video.status == "F"){
                          count += 1;
                      }
                  }
                  if (count > 0){
                      this.sessionList.push(session);
                  }
              }else if (this.missingOnly){
                  let count = 0;
                  for (let video of session.videos){
                      if (video.status == "U"){
                          count += 1;
                      }
                  }
                  if (count > 0){
                      this.sessionList.push(session);
                  }
              }
          }
      }
      this.filteredSession = this.sessionList;
      this.onSessionPagination();
  }

  onSessionPagination(){
      this.nPeriods = this.filteredSession.length;
      this.doSessionPagination = (this.nPeriods > this.periodsPerPage);
      this.currPageSession = 1;
      if (this.doSessionPagination){
          this.periodsSubset = this.filteredSession.slice(0,this.periodsPerPage);
      }else{
          this.periodsSubset = this.filteredSession;
      }
      if (this.nPeriods > 0){
          this.activeSession = this.filteredSession[0];
          let sessions = [];
          sessions.push(this.activeSession);
          this.getUserVideos(sessions);
          this.onVideoPagination();
      }
  }

  onSessionPageChange(){
      var start: number;
      var stop: number;
      start = (this.currPageSession-1)*this.periodsPerPage;
      stop = start+this.periodsPerPage;
      this.periodsSubset = this.filteredSession.slice(start,stop);
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
          this.filteredSession = this.sessionList
      }else{
          this.filteredSession = [];
          for (let session of this.sessionList){
              let flag = 0
              for (let tagPk of this.selectedTags){
                  for (let sessionTag of session.labels){
                      if (sessionTag.pk == tagPk){
                          flag = flag + 1;
                      }
                  }
              }
              if (flag == this.selectedTags.length){
                  this.filteredSession.push(session);
              }
          }
      }
      this.getUserVideos(this.filteredSession);
      if (this.grouBySession){
          this.onSessionPagination();
      }else{
          this.onVideoPagination();
      }

  }

  getCheckClass(pk:number) {
      //console.log("checking is in "+pk);
      if (this.selectedTags.some(x=>x==pk)) {
          return 'fa-check-square';
      }else {
          return 'fa-square';
      }
  }

  onSessionSelect(session:Period){
      if (!(this.activeSession.pk == session.pk)){
          this.activeVideo = null;
          this.activeSession = session;
          let sessions = [];
          sessions.push(this.activeSession);
          this.getUserVideos(sessions);
          this.onVideoPagination();
      }
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
      //this.activeVideo = new Object();
      //this.activeVideo['status'] = "P";
      //let videoP = document.getElementById("videoPlayer");
      this.activeVideo = video;
      this.activeVideoPk = video.pk;
      if (this.videoPlayer != null){
          if (this.activeVideo['status'] == "C"){
              this.videoPlayer.nativeElement.load();
          }
      }
  }

  onBeforeSend(event) {
      this.fileUploadError = "";
      event.xhr.setRequestHeader('Authorization', 'JWT ' + localStorage.getItem("id_token"));
  }

  checkUploadFilename(event){
      this.fileUploadError = "";
      this.uploadSourceUrl = "";
      let uploadFile = event.files[0];
      if (uploadFile.name == this.activeVideo.filename){
          this.uploadSourceUrl = 'https://api.tennishots.com/api/sourceupload/'+this.activeVideo.pk+'/';
      }else{
          this.fileUploadError = "Please make sure you are selecting the correct video."
          //let actVid = this.activeVideo;
          //this.activeVideo = null;
          //this.activeVideo = actVid;
      }
      //console.log(event.files[0]);
      //this.fileUploadError = "Blaaaaa!"
  }

  onUpload(event){
      this.activeVideo.status = "P";
  }

  onRetry(pk: number){
      this.tennistatService.process_video("VideoSource", pk)
            .subscribe( res => {});
      this.activeVideo.status = "P";
  }

}
