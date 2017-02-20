import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { FileSelectDirective, FileDropDirective, FileUploader } from 'ng2-file-upload/ng2-file-upload';

import { ProfileService } from '../services/profile.service';
import { TennistatService } from '../services/tennistat.service';

import { SonyFilter, SOFilters, PeriodsPicker, DateRange, NumberRange } from '../objects/sonyfilter';
import { Period, UserPeriodsList } from '../objects/period';
import { SonyResponse } from '../objects/sonyresponse';
import { Label } from '../objects/label';

import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit {

    userChoices: any;
    userChoices_keys:any[];
    activeUser: string;
    activeSession = new Period();
    previousUser: string = '';
    userProfile: any;
    doSessionPagination: boolean;
    nPeriods: number;
    periodsPerPage: number = 4;
    currPageSession: number;
    doVideoPagination: boolean;
    nVideos: number;
    currPageVideo: number;
    videoSubset: any[] = [];
    sessionList: Period[];
    filteredSession: Period[];
    periodsSubset: Period[];
    tagList: Label[] = [];
    selectedTags: number[] = [];
    activeVideo: any;
    activeVideoPk: number = 0;
    uploadSourceUrl: string;
    timezoneString: string = "";
    fileUploadError = "";

  constructor(  private route: ActivatedRoute,
                private router: Router,
                private profileService: ProfileService,
                private tennistatService: TennistatService) { }

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
              this.router.navigate(['summary']);
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
  }

  onUserSelectClick() {
      if (!(this.activeUser == this.previousUser)){
          this.sessionList = [];
          this.getUserSessions(this.activeUser);
          this.selectedTags = [];
          this.refreshTags(this.activeUser);
          //this.onPeriodChange(this.activePeriod);
          this.previousUser = this.activeUser;
      }
  }

  getUserSessions(user:string) {
      this.tennistatService.get_periods(user, 'session')
        .subscribe(data=>{
            for (let session of data){
                if (session.video_count > 0){
                    this.sessionList.push(session)
                }
            }
            this.filteredSession = this.sessionList;
            this.onSessionPagination();
        });
  }

  refreshTags(user:string) {
      this.tennistatService.get_tags(user)
            .subscribe( res => {
                this.tagList = res;
            });
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
      this.onSessionPagination()
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
          this.onVideoPagination();
      }
  }

  onVideoPagination(){
      this.nVideos = this.activeSession.videos.length;
      this.doVideoPagination = (this.nVideos > this.periodsPerPage);
      this.currPageVideo = 1;
      if (this.doSessionPagination){
          this.videoSubset = this.activeSession.videos.slice(0,this.periodsPerPage);
      }else{
          this.videoSubset = this.activeSession.videos;
      }
  }

  onVideoPageChange(){
      var start: number;
      var stop: number;
      start = (this.currPageVideo-1)*this.periodsPerPage;
      stop = start+this.periodsPerPage;
      this.videoSubset = this.activeSession.videos.slice(start,stop);
  }

  onVideoSelect(video:any){
      this.activeVideo = null;
      this.activeVideo = video;
      this.activeVideoPk = video.pk;
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
          this.uploadSourceUrl = 'http://localhost:8000/api/sourceupload/'+this.activeVideo.pk+'/';
          console.log("Same!")
      }else{
          console.log("Different!")

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

}
