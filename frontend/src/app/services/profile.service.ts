import { Injectable } from '@angular/core';
import { TennistatService } from './tennistat.service';
import { AuthService } from './auth.service';

@Injectable()
export class ProfileService {

    private loggedIn:boolean;
    private userProfile:any = null;

    constructor(private authService:AuthService, private tennistatService:TennistatService) {}

    refreshProfile() {
        if (this.authService.loggedIn()){
            this.tennistatService.get_profile()
                  .subscribe(res => {
                      this.userProfile = res;
                      localStorage.setItem('userProfile', JSON.stringify(res));
                      return this.userProfile
                  });
        }
    }

    getProfile() {
        if (this.userProfile === null){
            return JSON.parse(localStorage.getItem('userProfile'))
        }else{
            return this.userProfile
        }
    }
}
