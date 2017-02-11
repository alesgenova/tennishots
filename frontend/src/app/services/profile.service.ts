import { Injectable } from '@angular/core';
import { TennistatService } from './tennistat.service';
import { AuthService } from './auth.service';

@Injectable()
export class ProfileService {

    private loggedIn:boolean;
    private userProfile:any;

    constructor(private authService:AuthService, private tennistatService:TennistatService) {}

    refreshProfile() {
        if (this.authService.loggedIn()){
            this.tennistatService.get_profile()
                  .subscribe(res => this.userProfile = res);
        }
    }

    getProfile() {
        return this.userProfile;
    }
}
