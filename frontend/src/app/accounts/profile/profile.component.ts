import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormBuilder, FormGroup, Validators }  from '@angular/forms';

import { UserProfile } from '../../objects/registration';
import { TennistatService } from  '../../services/tennistat.service';
import { ProfileService } from  '../../services/profile.service';
import { NavigationService } from '../../services/navigation.service';

import {Subscription} from 'rxjs/Subscription';

import { ARM_CHOICES, BACKHAND_CHOICES, UNIT_CHOICES, PRIVACY_CHOICES } from '../../objects/registration';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  //userProfile: UserProfile;
  userProfile = new UserProfile();
  profileForm: FormGroup;
  armChoices = ARM_CHOICES;
  unitChoices = UNIT_CHOICES;
  backhandChoices = BACKHAND_CHOICES;
  privacyChoices = PRIVACY_CHOICES;
  userProfileSubscription: Subscription;

  constructor(private fb: FormBuilder,
              //private authService: AuthService,
              private tennistatService: TennistatService,
              private profileService: ProfileService,
              private router: Router,
              private navigationService: NavigationService) {}

  ngOnInit() {
      this.navigationService.setActiveSection("services");
      this.userProfileSubscription = this.profileService.userProfile$
        .subscribe(profile => {
            this.createProfileForm(profile);
        });
  }

  createProfileForm(userProfile:UserProfile){
      // Here we are using the FormBuilder to build out our form.
      this.profileForm = this.fb.group({
            first_name: [userProfile.first_name,Validators.required],
            last_name: userProfile.last_name,
            arm: userProfile.arm,
            units: userProfile.units,
            backhand: userProfile.backhand,
            privacy: userProfile.privacy
      });
  }

  onSubmit(){
      this.tennistatService.update_profile(this.profileForm.value)
            .subscribe( res => {
                //this.profileService.refreshProfile();
                this.router.navigate(['']);
            } );
  }

  onBeforeSend(event) {
      event.xhr.setRequestHeader('Authorization', 'JWT ' + localStorage.getItem("id_token"));
  }

  onUpload(event){
      //this.profileService.refreshProfile();
  }

}
