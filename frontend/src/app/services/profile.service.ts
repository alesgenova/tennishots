import { Injectable } from '@angular/core';
import { TennistatService } from './tennistat.service';
import { AuthService } from './auth.service';
import { PlayerProfile } from '../objects/playerprofile';
import { UserProfile } from '../objects/registration';

import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class ProfileService {

    private myUsername: string = "";
    private loggedIn:boolean;
    private userChoices:any = new Object();
    private userProfile:UserProfile = new UserProfile();
    private customerProfile:any = null;
    //private playerProfile:any = null;
    private timezoneString: string = '';
    private playerProfiles: any = new Object();
    private playerSummaries: any = new Object();

    private userProfileSubject = new BehaviorSubject<UserProfile>(new UserProfile());
    userProfile$ = this.userProfileSubject.asObservable();

    private playerProfilesSubject = new BehaviorSubject<any>({});
    playerProfiles$ = this.playerProfilesSubject.asObservable();

    private userChoicesSubject = new BehaviorSubject<any>({});
    userChoices$ = this.userChoicesSubject.asObservable();

    private playerSummariesSubject = new BehaviorSubject<any>({});
    playerSummaries$ = this.playerSummariesSubject.asObservable();

    constructor(private authService:AuthService, private tennistatService:TennistatService) {}

    updatedUserProfile(){
      this.userProfileSubject.next(this.userProfile);
    }

    updatedPlayerProfiles() {
      this.playerProfilesSubject.next(this.playerProfiles);
    }

    updatedPlayerSummaries() {
      this.playerSummariesSubject.next(this.playerSummaries);
    }

    updatedUserChoices() {
      this.userChoicesSubject.next(this.userChoices);
    }

    refreshProfile() {
        if (this.authService.loggedIn()){
            this.tennistatService.get_profile()
                  .subscribe(res => {
                      this.userProfile = res;
                      localStorage.setItem('userProfile', JSON.stringify(res));
                      this.refreshUserChoices();
                      this.updatedUserProfile();
                  });
        }
    }

    refreshPlayerProfile(user:string){
        this.tennistatService.get_player_profile(user)
            .subscribe( res => {
              this.playerProfiles[user] = res;
              localStorage.setItem(user+'_playerProfile', JSON.stringify(res));
              this.updatedPlayerProfiles();
            });
    }

    refreshPlayerSummary(user:string){
        this.tennistatService.get_player_summary(user)
            .subscribe( res => {
              this.playerSummaries[user] = res;
              localStorage.setItem(user+'_playerSummary', JSON.stringify(res));
              this.updatedPlayerSummaries();
            });
    }

    checkShotCount(){
      let playerProfile = this.playerProfiles[this.myUsername];
      if (playerProfile == null){
        return true
      }else{
        let count = playerProfile.shot_count;
        if (count == 0){
          return false
        }else{
          return true
        }
      }
    }

    refreshUserChoices(){
      this.userChoices = {};
      this.userChoices[this.myUsername] = {username:this.myUsername,
                             first_name:"Myself",
                             last_name:"",
                             avatar:this.userProfile.avatar};
      for (let friend of this.userProfile.friends){
          this.userChoices[friend.user] = {username:friend.user,
                                 first_name:friend.first_name,
                                 last_name:friend.last_name,
                                 avatar:friend.avatar};
      };
      //console.log("userChoices inside");
      //console.log(this.userChoices);
      this.updatedUserChoices();
    }

/*
    getProfile() {
        if (this.userProfile === null){
            this.userProfile = JSON.parse(localStorage.getItem('userProfile'));
        }
        return this.userProfile
    }
*/
    initialize(){
      if (this.authService.loggedIn()){
        this.myUsername = localStorage.getItem('username');
        this.userProfile = JSON.parse(localStorage.getItem('userProfile'));
        if (this.userProfile != null){
          this.playerProfiles[this.myUsername] = JSON.parse(localStorage.getItem(this.myUsername+'_playerProfile'));
          this.playerSummaries[this.myUsername] = JSON.parse(localStorage.getItem(this.myUsername+'_playerSummary'));
          for (let friend of this.userProfile.friends){
            this.playerProfiles[friend.user] = JSON.parse(localStorage.getItem(friend.user+'_playerProfile'));
            this.playerSummaries[friend.user] = JSON.parse(localStorage.getItem(friend.user+'_playerSummary'));
          }
          this.refreshUserChoices();
        }else{
            this.userProfile = new UserProfile();
            this.playerProfiles[this.myUsername] = new PlayerProfile();
        }
        // checkLastCanges is already done all the time (including on initialization) in authGuard,
        // so we can save an expensive request.
        //this.checkLastChanges();
        this.updatedPlayerProfiles();
        this.updatedPlayerSummaries();
        this.updatedUserProfile();
        //console.log("on initialize")
        //console.log(this.playerProfiles)
      }
    }

    cleanup(){
        this.playerProfiles = new Object();
        this.playerSummaries = new Object();
        this.userProfile = new UserProfile();
        this.userChoices = new Object();
    }


    checkLastChanges(){
      // Kinda complex function to make sure that everything is up to date with the server
      // we'll have frequen calls to check when is the lates change for each user,
      // and if something has changed we'll refresh the local copy of the playerProfile
        if (this.authService.loggedIn()){
            //console.log("playerProfiles");
            //console.log(this.playerProfiles);
            this.tennistatService.get_last_changes()
                .subscribe(res => {
                  for (let entry of res){
                    let flag = 0;
                    if (this.playerProfiles[entry.user] != null) {
                      if (entry.lastchange == this.playerProfiles[entry.user].lastchange){
                        flag = 1
                      }
                    }
                    if (flag != 1){
                      this.refreshPlayerProfile(entry.user);
                      this.refreshPlayerSummary(entry.user);
                      if (entry.user == this.myUsername){
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

/*
    getPlayerProfile(user:string){
        if (user == ""){
          let profile = this.getProfile();
          if (profile === null){
            return new PlayerProfile();
          }else{
            user = this.getProfile().user;
          }
        }
        if (this.playerProfiles[user] === null){
            return new PlayerProfile();
            //this.playerProfiles[user] = JSON.parse(localStorage.getItem(user+'_playerProfile'));
        }
        return this.playerProfiles[user]
    }
*/

    getUsername(){
      return this.myUsername
    }

    setUsername(user:string){
      this.myUsername = user;
    }

/*
    getPlayerProfile(user:string){
        let playerProfile = new PlayerProfile();
        if (user == ""){
          playerProfile = this.playerProfiles[this.myUsername];
        }else{
          playerProfile = this.playerProfiles[user];
        }
        if (playerProfile === null){
            return new PlayerProfile();
        }
        return playerProfile
    }
*/

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
