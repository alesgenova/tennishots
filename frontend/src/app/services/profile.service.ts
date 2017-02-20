import { Injectable } from '@angular/core';
import { TennistatService } from './tennistat.service';
import { AuthService } from './auth.service';

@Injectable()
export class ProfileService {

    private loggedIn:boolean;
    private userProfile:any = null;
    private timezoneString: string = '';

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

    refreshTimezoneString(){
        let timezoneOffset = (new Date().getTimezoneOffset());
        let outString = '';
        if (timezoneOffset > 0){
            outString += '-';
        }else{
            timezoneOffset = -timezoneOffset;
            outString += '+';
        }
        let hours = Math.floor(timezoneOffset/60)
        let minutes = timezoneOffset - hours*60
        if (hours < 10){
            outString += '0'+hours+':'
        }else{
            outString += hours+':'
        }
        if (minutes < 10){
            outString += '0'+minutes
        }else{
            outString += minutes
        }
        this.timezoneString = outString;
        return this.timezoneString
    }

    getTimezoneString(){
        if (this.timezoneString == ''){
            return this.refreshTimezoneString()
        }
        return this.timezoneString
    }


}
