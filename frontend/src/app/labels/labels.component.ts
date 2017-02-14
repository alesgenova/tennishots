import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Label } from '../objects/label';
import { Period, UserPeriodsList } from '../objects/period';

import { TennistatService } from  '../services/tennistat.service';
import { ProfileService } from  '../services/profile.service';

@Component({
  selector: 'app-labels',
  templateUrl: './labels.component.html',
  styleUrls: ['./labels.component.css']
})
export class LabelsComponent implements OnInit {

  userProfile: any;
  tagList: Label[];
  sessionList: Period[];
  doPagination: boolean;
  nPeriods: number;
  periodsPerPage: number = 6;
  currPage: number = 1;
  periodsSubset: Period[];

  constructor(private tennistatService: TennistatService, private profileService: ProfileService) { }

  ngOnInit() {
      this.userProfile = this.profileService.getProfile();
      this.refreshTags();
      this.getSessions();
  }

  refreshTags() {
      this.tennistatService.get_tags(this.userProfile.user)
            .subscribe( res => {
                this.tagList = res;
            });
  }

  getSessions() {
      this.tennistatService.get_periods(this.userProfile.user, "session")
        .subscribe(data=>{
            this.sessionList = data;
            this.nPeriods = this.sessionList.length;
            this.doPagination = (this.nPeriods > this.periodsPerPage);
            this.periodsSubset = this.sessionList.slice(0,this.periodsPerPage);
        });
  }

  onPageChange(){
      var start: number;
      var stop: number;
      start = (this.currPage-1)*this.periodsPerPage;
      stop = start+this.periodsPerPage;
      this.periodsSubset = this.sessionList.slice(start,stop);
  }



}
