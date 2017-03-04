import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormBuilder, FormGroup, Validators }  from '@angular/forms';

import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

import { Label } from '../objects/label';
import { Period, UserPeriodsList } from '../objects/period';

import { TennistatService } from  '../services/tennistat.service';
import { ProfileService } from  '../services/profile.service';
import { NavigationService } from '../services/navigation.service';

import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-labels',
  templateUrl: './labels.component.html',
  styleUrls: ['./labels.component.css']
})
export class LabelsComponent implements OnInit {

  myUsername: string;
  tagList: Label[];
  sessionList: Period[];
  doPagination: boolean;
  nPeriods: number;
  periodsPerPage: number = 8;
  currPage: number = 1;
  periodsSubset: Period[];
  categoryButtonText = 'Category';
  newTag: FormGroup;

  playerProfilesSubscription: Subscription;
  playerProfiles: any;

  constructor(private tennistatService: TennistatService,
              private profileService: ProfileService,
              private fb: FormBuilder,
              //private modalService: NgbModal,
              private navigationService: NavigationService) { }

  ngOnInit() {
      this.navigationService.setActiveSection("services");
      this.myUsername = this.profileService.getUsername();
      // subscribe to changes in the player profiles
      this.playerProfilesSubscription = this.profileService.playerProfiles$
        .subscribe(profiles => {
          this.playerProfiles = profiles;
          this.fromProfileToPagination();
        });
      this.createTagForm();
  }

  fromProfileToPagination() {
      let activePlayer = this.playerProfiles[this.myUsername];
      this.sessionList = activePlayer.periods.session;
      this.tagList = activePlayer.labels;
      this.nPeriods = this.sessionList.length;
      this.doPagination = (this.nPeriods > this.periodsPerPage);
      this.onPageChange();
      //this.previousUser = this.activeUser;
  }

  createTagForm(){
      this.newTag = this.fb.group({
            name: ["",Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(10)])],
            category: [null,Validators.compose([Validators.required])]
        });
  }

  refreshTags() {
      this.tennistatService.get_tags(this.myUsername)
            .subscribe( res => {
                this.tagList = res;
            });
  }

  onPageChange(){
      var start: number;
      var stop: number;
      start = (this.currPage-1)*this.periodsPerPage;
      stop = start+this.periodsPerPage;
      this.periodsSubset = this.sessionList.slice(start,stop);
  }

  onCreateTag(){
      this.tennistatService.create_tag(this.myUsername, this.newTag.value.name, this.newTag.value.category)
            .subscribe( res =>{
                this.createTagForm();
                this.refreshTags();
                this.onCategorySelect(null);
            });
  }

  onDeleteTag(pk:number){
      if (true){
          this.tennistatService.delete_tag(pk)
                .subscribe( res =>{
                    this.refreshTags();
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

  getMissingTags(sessionTags:Label[]){
      let missingTags: Label[] = [];
      for (let tag of this.tagList){
          if (sessionTags.some(x=>x.pk==tag.pk)) {

          }else{
            missingTags.push(tag);
          }
      }
      return missingTags
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

  onAssignTag(tagPk:number, sessionPk:number, action:string){
      this.tennistatService.assign_tag(tagPk, sessionPk, action)
            .subscribe( res =>{
                this.profileService.checkLastChanges();
            });
  }

  onCategorySelect(category: number){
      this.newTag.setValue({
         category: category,
         name: this.newTag.value.name
      });
      if (category == null){
          this.categoryButtonText = 'Category';
      }else if (category == 0){
          this.categoryButtonText = '<span class="badge badge-primary">Surface</span>';
      }else if (category == 1){
          this.categoryButtonText = '<span class="badge badge-success">Opponent</span>';
      }else if (category == 2){
          this.categoryButtonText = '<span class="badge badge-info">Game type</span>';
      }else if (category == 3){
          this.categoryButtonText = '<span class="badge badge-warning">Competition</span>';
      }else if (category == 4){
          this.categoryButtonText = '<span class="badge badge-danger">Condition</span>';
      }else if (category == 5){
          this.categoryButtonText = '<span class="badge badge-default">Other</span>';
      }
  }


}
