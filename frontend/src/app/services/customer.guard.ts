import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate } from '@angular/router';

import { AuthService } from './auth.service';
import { ProfileService } from './profile.service';

@Injectable()
export class CustomerGuard implements CanActivate {

  constructor(private router: Router, private profileService: ProfileService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    // I the user's balance higher than $10?
    let check =  this.profileService.checkAmountDue();
    if (check){
      return true
    }else{
      this.router.navigate(['/cart']);
      return false
    }
  }
}
