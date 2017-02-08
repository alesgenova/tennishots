import { Component, OnInit } from '@angular/core';

import { UserProfile } from '../objects/registration';
import { TennistatService } from  '../services/tennistat.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userProfile: UserProfile;
  constructor(private tennistatService: TennistatService) {
      this.userProfile = new UserProfile();
  }

  ngOnInit() {
      this.refreshUserProfile();
  }

  refreshUserProfile() {
      this.tennistatService.get_profile()
            .subscribe( res => {
                localStorage.setItem('userProfile', JSON.stringify(res));
                this.userProfile = res;
            });
  }

}
