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
  periodsPerPage: number = 8;
  currPage: number = 1;
  periodsSubset: Period[];
  categoryButtonText = 'Category';
  newTag: any = {category:-1, name:""};

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

  onCategorySelect(catNum: number){
      this.newTag.category = catNum;
      if (catNum == 0){
          this.categoryButtonText = '<span class="badge badge-primary">Surface</span>';
      }else if (catNum == 1){
          this.categoryButtonText = '<span class="badge badge-success">Opponent</span>';
      }else if (catNum == 2){
          this.categoryButtonText = '<span class="badge badge-info">Game type</span>';
      }else if (catNum == 3){
          this.categoryButtonText = '<span class="badge badge-warning">Competitive</span>';
      }else if (catNum == 4){
          this.categoryButtonText = '<span class="badge badge-danger">Conditions</span>';
      }else if (catNum == 5){
          this.categoryButtonText = '<span class="badge badge-default">Other</span>';
      }
  }


}
