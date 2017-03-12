import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate } from '@angular/router';

import { AuthService } from './auth.service';
import { ProfileService } from './profile.service';

@Injectable()
export class ImportGuard implements CanActivate {

  constructor(private router: Router, private authService: AuthService, private profileService: ProfileService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    // has the user already imported some shots?
    let check =  this.profileService.checkShotCount();
    if (check){
      return true
    }else{
      this.router.navigate(['/landing']);
      return false
    }

    //if (1<2){return true}
    /*

    let playerProfile = this.profileService.getPlayerProfile("");
    if (typeof playerProfile == "undefined" || playerProfile === null) {
      //this.router.navigate(['/landing']);
      //return false;
      setTimeout(() => {
        let url_array: string[] = [];
        for (let segment of route.url){
          url_array.push(segment.path);
        }
        console.log(url_array);
        this.router.navigate(url_array);
        return false;
      }, 1000);
    }else if (playerProfile.shot_count == 0){
        //this.profileService.refreshPlayerProfile();
        this.router.navigate(['/landing']);
        return false;
    }else{
      // then let them through
      return true;
    }

    */
  }
}
