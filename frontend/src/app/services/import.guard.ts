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
    let playerProfile = this.profileService.getPlayerProfile();
    if (playerProfile.shot_count == 0){
        this.router.navigate(['/landing']);
        return false;
    }
    // then let them through
    return true;
  }
}
