import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormBuilder, FormGroup, Validators }  from '@angular/forms';

import { FileSelectDirective, FileDropDirective, FileUploader } from 'ng2-file-upload/ng2-file-upload';

import { UserProfile } from '../objects/registration';
import { TennistatService } from  '../services/tennistat.service';
import { ProfileService } from  '../services/profile.service';

import { ARM_CHOICES, BACKHAND_CHOICES, UNIT_CHOICES, PRIVACY_CHOICES } from '../objects/registration';

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

  constructor(private fb: FormBuilder,
              //private authService: AuthService,
              private tennistatService: TennistatService,
              private profileService: ProfileService,
              private router: Router) {}

  ngOnInit() {
      this.createProfileForm();
  }

  createProfileForm(){
      let userProfile = this.profileService.getProfile();
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
                this.profileService.refreshProfile();
                this.router.navigate(['']);
            } );
  }

  onBeforeSend(event) {
      event.xhr.setRequestHeader('Authorization', 'JWT ' + localStorage.getItem("id_token"));
  }

  onUpload(event){
      this.profileService.refreshProfile();
  }

}
