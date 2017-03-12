import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ProfileService } from '../services/profile.service';
import { NavigationService } from '../services/navigation.service';

import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-csvupload',
  templateUrl: './csvupload.component.html',
  styleUrls: ['./csvupload.component.css']
})
export class CsvuploadComponent implements OnInit {

  uploaded: boolean = false;
  processed: boolean = false;
  userProfileSubscription: Subscription;

  constructor(private profileService: ProfileService,
              private navigationService: NavigationService,
              private router: Router) { }

  ngOnInit() {
    this.navigationService.setActiveSection("services");
    this.userProfileSubscription = this.profileService.userProfile$
      .subscribe(profile => {
          if (this.uploaded){
            this.processed = true;
            this.router.navigate(['home']);
          }
      });
  }

  onBeforeSend(event) {
      event.xhr.setRequestHeader('Authorization', 'JWT ' + localStorage.getItem("id_token"));
  }

  onUpload(event){
      this.uploaded = true;
      let itercount = 0;
      let intervalId = setInterval(() => {
        itercount += 1;
        this.profileService.checkLastChanges();
        console.log('hello');
        if (this.processed || itercount > 40){
          clearInterval(intervalId);
        }
      }, 5000);
  }

}
