import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate } from '@angular/router';

import { AuthService } from './auth.service';
import { ProfileService } from './profile.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private authService: AuthService, private profileService: ProfileService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    // is the user logged in?
    if (!this.authService.loggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }
    this.profileService.checkLastChanges();
    // has the user already imported some shots?
    // does the user have any friends?

    // does the user owe us money?

    // then let them through
    return true;
  }
}
