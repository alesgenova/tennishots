import { Injectable } from '@angular/core';
import { TennistatService } from './tennistat.service';
import { AuthService } from './auth.service';

@Injectable()
export class ProfileService {

    private loggedIn:boolean;
    private userProfile:any = null;
    private customerProfile:any = null;
    //private playerProfile:any = null;
    private timezoneString: string = '';
    private playerProfiles: any = new Object();

    constructor(private authService:AuthService, private tennistatService:TennistatService) {}

    refreshProfile() {
        if (this.authService.loggedIn()){
            this.tennistatService.get_profile()
                  .subscribe(res => {
                      this.userProfile = res;
                      localStorage.setItem('userProfile', JSON.stringify(res));
                  });
        }
    }

    getProfile() {
        if (this.userProfile === null){
            this.userProfile = JSON.parse(localStorage.getItem('userProfile'));
        }
        return this.userProfile
    }


    checkLastChanges(){
      // Kinda complex function to make sure that everything is up to date with the server
      // we'll have frequen calls to check when is the lates change for each user,
      // and if something has changed we'll refresh the local copy of the playerProfile
        if (this.authService.loggedIn()){
            this.tennistatService.get_last_changes()
                .subscribe(res => {
                  for (let entry of res){
                    let flag = 0;
                    if (typeof this.playerProfiles[entry.user] != "undefined") {
                      if (entry.lastchange == this.playerProfiles[entry.user].lastchange){
                        flag = 1
                      }
                    }
                    if (flag != 1){
                      this.tennistatService.get_player_profile(entry.user)
                          .subscribe( res2 => {
                            this.playerProfiles[entry.user] = res2;
                            localStorage.setItem(entry.user+'_playerProfile', JSON.stringify(res2));
                          });
                      if (entry.user == this.getProfile().user){
                        this.refreshProfile();
                      }
                    }
                  }
                } );
        }
    }

//    refreshPlayerProfiles(){
//      if (this.authService.loggedIn()){
//            this.tennistatService.get_player_profile()
//                  .subscribe(res => {
//                      this.playerProfile = res;
//                      localStorage.setItem('playerProfile', JSON.stringify(res));
//                      return this.playerProfile
//                  });
//        }
//    }

    getPlayerProfile(user:string){
        if (user == ""){
          let profile = this.getProfile();
          if (profile === null){
            return null
          }else{
            user = this.getProfile().user;
          }
        }
        if (this.playerProfiles[user] === null){
            this.playerProfiles[user] = JSON.parse(localStorage.getItem(user+'_playerProfile'));
        }
        return this.playerProfiles[user]
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
