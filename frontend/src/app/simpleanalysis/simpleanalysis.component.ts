import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { ProfileService } from '../services/profile.service';
import { TennistatService } from '../services/tennistat.service';

import { SonyFilter, SOFilters, PeriodsPicker, DateRange, NumberRange } from '../objects/sonyfilter';
import { Period, UserPeriodsList } from '../objects/period';
import { SonyResponse } from '../objects/sonyresponse';
import { Label } from '../objects/label';

import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-simpleanalysis',
  templateUrl: './simpleanalysis.component.html',
  styleUrls: ['./simpleanalysis.component.css']
})
export class SimpleanalysisComponent implements OnInit {

    userChoices: any;
    userChoices_keys:any[];
    stats = new SonyResponse();
    listOfPeriods = new UserPeriodsList();
    activeUser: string;
    activePk: number = -1;
    activePeriod: string = 'session';
    previousUser: string = '';
    userProfile: any;
    doPagination: boolean;
    nPeriods: number;
    periodsPerPage: number = 4;
    currPage: number;
    filteredPeriods: Period[];
    periodsSubset: Period[];
    tagList: Label[] = [];
    selectedTags: number[] = [];

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
          this.listOfPeriods = new UserPeriodsList();
          this.getUserPeriods(this.activeUser);
          this.selectedTags = [];
          this.refreshTags(this.activeUser);
          //this.onPeriodChange(this.activePeriod);
          this.previousUser = this.activeUser;
          this.activePk = -1
          if (this.activePeriod == 'all'){
              this.onPeriodSelect(0);
          }
      }
  }

  getUserPeriods(user:string){
      this.getPeriods(user, "session");
      this.getPeriods(user, "week");
      this.getPeriods(user, "month");
      this.getPeriods(user, "year");
  }

  getPeriods(user:string, name:string) {
      this.tennistatService.get_periods(user, name)
        .subscribe(data=>{
            this.listOfPeriods[name] = data;
            if (name == this.activePeriod){
                this.onPeriodChange(name);
            }
        });
  }

  refreshTags(user:string) {
      this.tennistatService.get_tags(user)
            .subscribe( res => {
                this.tagList = res;
            });
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
          this.currPage = 1;
          if (this.doPagination){
              this.periodsSubset = this.listOfPeriods[name].slice(0,this.periodsPerPage);
          }else{
              this.periodsSubset = this.listOfPeriods[name]
          }
      }
  }

  onPageChange(){
      var start: number;
      var stop: number;
      start = (this.currPage-1)*this.periodsPerPage;
      stop = start+this.periodsPerPage;
      this.periodsSubset = this.listOfPeriods[this.activePeriod].slice(start,stop);
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
